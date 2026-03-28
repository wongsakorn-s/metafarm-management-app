from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import HiveStatus

class HarvestRecordBase(BaseModel):
    honey_yield_ml: float
    propolis_yield_g: float
    harvest_date: Optional[datetime] = None

class HarvestRecordCreate(HarvestRecordBase):
    pass

class HarvestRecord(HarvestRecordBase):
    id: int
    hive_id: int
    harvest_date: datetime

    class Config:
        from_attributes = True

class InspectionRecordBase(BaseModel):
    notes: Optional[str] = None
    hive_status: Optional[HiveStatus] = None
    inspection_date: Optional[datetime] = None

class InspectionRecordCreate(InspectionRecordBase):
    pass

class InspectionRecord(InspectionRecordBase):
    id: int
    hive_id: int
    image_url: Optional[str] = None
    inspection_date: datetime

    class Config:
        from_attributes = True

class HiveBase(BaseModel):
    hive_id: str
    name: Optional[str] = None
    species: Optional[str] = None
    location: Optional[str] = None
    status: HiveStatus = HiveStatus.NORMAL

class HiveCreate(HiveBase):
    pass

class Hive(HiveBase):
    id: int
    created_at: datetime
    harvests: List[HarvestRecord] = []
    inspections: List[InspectionRecord] = []

    class Config:
        from_attributes = True

class WeatherDataBase(BaseModel):
    temp_c: float
    humidity: float
    location_name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class WeatherData(WeatherDataBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

