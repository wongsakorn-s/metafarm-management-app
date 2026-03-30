import logging
from datetime import UTC, datetime, timedelta
from threading import Lock

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..settings import settings

router = APIRouter(prefix="/api/weather", tags=["weather"])
logger = logging.getLogger("metafarm.weather")

_weather_cache_lock = Lock()
_weather_cache_value: schemas.WeatherData | None = None
_weather_cache_expires_at: datetime | None = None


def utcnow() -> datetime:
    return datetime.now(UTC)


def get_cached_weather() -> schemas.WeatherData | None:
    with _weather_cache_lock:
        if _weather_cache_value is None or _weather_cache_expires_at is None:
            return None
        if _weather_cache_expires_at <= utcnow():
            return None
        return _weather_cache_value


def set_cached_weather(weather_data: schemas.WeatherData) -> None:
    with _weather_cache_lock:
        global _weather_cache_value, _weather_cache_expires_at
        _weather_cache_value = weather_data
        _weather_cache_expires_at = utcnow() + timedelta(seconds=settings.weather_cache_ttl_seconds)


def build_mock_weather() -> schemas.WeatherData:
    return schemas.WeatherData(
        id=0,
        timestamp=utcnow(),
        temp_c=32.5,
        humidity=65,
        wind_speed_mps=2.8,
        cloudiness_pct=20,
        description="ท้องฟ้าโปร่ง",
        icon="01d",
        location_name="MetaFarm",
        location_name_th=settings.farm_location_name_th,
        source_name="OpenWeather (mock)",
    )


def latest_weather_from_db(db: Session) -> models.WeatherData | None:
    return db.query(models.WeatherData).order_by(models.WeatherData.timestamp.desc()).first()


@router.get("/current", response_model=schemas.WeatherData)
async def get_current_weather(db: Session = Depends(get_db)):
    cached_weather = get_cached_weather()
    if cached_weather:
        return cached_weather

    if not settings.openweather_api_key or "your_api_key_here" in settings.openweather_api_key:
        weather_data = build_mock_weather()
        set_cached_weather(weather_data)
        return weather_data

    url = (
        "https://api.openweathermap.org/data/2.5/weather"
        f"?lat={settings.farm_lat}&lon={settings.farm_lon}"
        f"&appid={settings.openweather_api_key}&units=metric&lang=th"
    )

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        logger.warning("weather_fetch_failed detail=%s", exc)
        latest_cached_db_weather = latest_weather_from_db(db)
        if latest_cached_db_weather:
            weather_data = schemas.WeatherData.model_validate(latest_cached_db_weather).model_copy(
                update={
                    "location_name_th": settings.farm_location_name_th,
                    "source_name": "OpenWeather (cached)",
                }
            )
            set_cached_weather(weather_data)
            return weather_data
        raise HTTPException(status_code=502, detail="Error fetching weather") from exc

    weather_entry = models.WeatherData(
        location_name=data.get("name"),
        temp_c=data["main"]["temp"],
        humidity=data["main"]["humidity"],
        description=data["weather"][0]["description"],
        icon=data["weather"][0]["icon"],
    )
    db.add(weather_entry)
    db.commit()
    db.refresh(weather_entry)

    weather_data = schemas.WeatherData.model_validate(weather_entry).model_copy(
        update={
            "location_name_th": settings.farm_location_name_th,
            "wind_speed_mps": data.get("wind", {}).get("speed"),
            "cloudiness_pct": data.get("clouds", {}).get("all"),
            "source_name": "OpenWeather",
        }
    )
    set_cached_weather(weather_data)
    return weather_data


@router.get("/history", response_model=list[schemas.WeatherData])
def get_weather_history(limit: int = Query(default=10, ge=1, le=100), db: Session = Depends(get_db)):
    return db.query(models.WeatherData).order_by(models.WeatherData.timestamp.desc()).limit(limit).all()
