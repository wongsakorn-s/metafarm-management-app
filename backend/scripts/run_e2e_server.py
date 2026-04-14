from __future__ import annotations

import os
from pathlib import Path
import sys

import uvicorn

BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / "backend"
E2E_DB_PATH = BASE_DIR / "backend" / ".e2e.sqlite3"
UPLOADS_DIR = BASE_DIR / "backend" / "static" / "uploads"
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("APP_ENV", "e2e")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{E2E_DB_PATH.as_posix()}")
os.environ.setdefault("CORS_ORIGINS", "http://127.0.0.1:4174")
os.environ.setdefault("ADMIN_USERNAME", "admin")
os.environ.setdefault("ADMIN_PASSWORD", "metafarm_admin_2026")
os.environ.setdefault("JWT_SECRET_KEY", "metafarm_e2e_secret_key_2026_very_secure")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "30")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")
os.environ.setdefault("LOG_LEVEL", "INFO")
os.environ.setdefault("E2E_PORT", "8010")

if E2E_DB_PATH.exists():
    E2E_DB_PATH.unlink()

if UPLOADS_DIR.exists():
    for upload_dir in UPLOADS_DIR.glob("HIVE-E2E-*"):
        for child in upload_dir.glob("**/*"):
            if child.is_file():
                child.unlink()
        for child in sorted(upload_dir.glob("**/*"), reverse=True):
            if child.is_dir():
                child.rmdir()
        upload_dir.rmdir()

from app.auth import ensure_bootstrap_admin
from app.database import SessionLocal, engine
from app.main import app
from app.models import Base

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    ensure_bootstrap_admin(db)
finally:
    db.close()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.environ["E2E_PORT"]), log_level="info")
