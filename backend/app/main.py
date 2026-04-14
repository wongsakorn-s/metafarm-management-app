import logging
import time
import uuid
from contextlib import asynccontextmanager
from collections import defaultdict, deque
from threading import Lock

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from .auth import ensure_bootstrap_admin
from .database import get_db
from .logging_config import configure_logging
from .routers import auth, hives, harvests, dashboard, inspections, weather, users
from .settings import settings

configure_logging(settings.log_level)
logger = logging.getLogger("metafarm.api")
_auth_rate_limit_events: dict[str, deque[float]] = defaultdict(deque)
_auth_rate_limit_lock = Lock()
REQUEST_COUNT = Counter(
    "metafarm_http_requests_total",
    "Total HTTP requests processed by MetaFarm",
    ["method", "path", "status_code"],
)
REQUEST_DURATION = Histogram(
    "metafarm_http_request_duration_seconds",
    "HTTP request duration for MetaFarm",
    ["method", "path"],
)

settings.static_dir.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.validate_runtime_configuration()
    db = next(get_db())
    try:
        ensure_bootstrap_admin(db)
        yield
    finally:
        db.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hives.router)
app.include_router(harvests.router)
app.include_router(dashboard.router)
app.include_router(inspections.router)
app.include_router(weather.router)
app.include_router(auth.router)
app.include_router(users.router)


def is_rate_limited(request: Request) -> bool:
    if request.url.path not in {"/api/auth/login", "/api/auth/refresh"}:
        return False

    window_seconds = settings.auth_rate_limit_window_seconds
    max_requests = settings.auth_rate_limit_requests
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{request.url.path}"
    now = time.time()

    with _auth_rate_limit_lock:
        events = _auth_rate_limit_events[key]
        while events and now - events[0] > window_seconds:
            events.popleft()
        if len(events) >= max_requests:
            return True
        events.append(now)
    return False


@app.middleware("http")
async def log_requests(request: Request, call_next):
    if is_rate_limited(request):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many authentication requests"},
            headers={"Retry-After": str(settings.auth_rate_limit_window_seconds)},
        )

    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.exception(
            "request_failed request_id=%s method=%s path=%s duration_ms=%s",
            request_id,
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    REQUEST_COUNT.labels(request.method, request.url.path, str(response.status_code)).inc()
    REQUEST_DURATION.labels(request.method, request.url.path).observe(duration_ms / 1000)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    logger.info(
        "request_completed request_id=%s method=%s path=%s status_code=%s duration_ms=%s",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("validation_error path=%s errors=%s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": jsonable_encoder(exc.errors())})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning("http_error path=%s status_code=%s detail=%s", request.url.path, exc.status_code, exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("unhandled_error path=%s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@app.get("/")
def read_root():
    return {"message": "Welcome to the Stingless Bee Hive Management API"}


@app.get("/health/live")
def live_healthcheck():
    return {"status": "ok"}


@app.get("/health/ready")
def readiness_healthcheck(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "environment": settings.app_env}


@app.get("/metrics")
def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)
