from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
import httpx
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/weather", tags=["weather"])

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
LAT = os.getenv("FARM_LAT", "13.310314")
LON = os.getenv("FARM_LON", "101.111504")

@router.get("/current", response_model=schemas.WeatherData)
async def get_current_weather(db: Session = Depends(get_db)):
    # In a real app, we'd cache this to avoid hitting API limits
    # For now, we fetch when requested
    
    if not OPENWEATHER_API_KEY or "your_api_key_here" in OPENWEATHER_API_KEY:
        # Return mock data if no key or still using placeholder
        return {
            "id": 0,
            "timestamp": datetime.utcnow(),
            "temp_c": 32.5,
            "humidity": 65,
            "description": "Mock Weather (Waiting for API Key)",
            "icon": "01d"
        }

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={LAT}&lon={LON}&appid={OPENWEATHER_API_KEY}&units=metric"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Error fetching weather")
        
        data = response.json()
        weather_entry = models.WeatherData(
            location_name=data.get("name"), # Added location name
            temp_c=data["main"]["temp"],
            humidity=data["main"]["humidity"],
            description=data["weather"][0]["description"],
            icon=data["weather"][0]["icon"]
        )
        db.add(weather_entry)
        db.commit()
        db.refresh(weather_entry)
        return weather_entry

@router.get("/history", response_model=list[schemas.WeatherData])
def get_weather_history(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(models.WeatherData).order_by(models.WeatherData.timestamp.desc()).limit(limit).all()
