from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime
from .models import HiveStatus, UserRole


def normalize_optional_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None

class HarvestRecordBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    honey_yield_ml: float = Field(ge=0, le=100000)
    propolis_yield_g: float = Field(ge=0, le=100000)
    harvest_date: Optional[datetime] = None

class HarvestRecordCreate(HarvestRecordBase):
    pass

class HarvestRecord(HarvestRecordBase):
    id: int
    hive_id: int
    harvest_date: datetime

class InspectionRecordBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    notes: Optional[str] = None
    hive_status: Optional[HiveStatus] = None
    inspection_date: Optional[datetime] = None

    @field_validator("notes")
    @classmethod
    def validate_notes(cls, value: Optional[str]) -> Optional[str]:
        value = normalize_optional_text(value)
        if value and len(value) > 1000:
            raise ValueError("Notes must not exceed 1000 characters")
        return value

class InspectionRecordCreate(InspectionRecordBase):
    pass

class InspectionRecord(InspectionRecordBase):
    id: int
    hive_id: int
    image_url: Optional[str] = None
    inspection_date: datetime

class HiveBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hive_id: str = Field(min_length=3, max_length=50)
    name: Optional[str] = None
    species: Optional[str] = None
    location: Optional[str] = None
    status: HiveStatus = HiveStatus.NORMAL

    @field_validator("hive_id")
    @classmethod
    def validate_hive_id(cls, value: str) -> str:
        normalized = value.strip().upper()
        allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_")
        if any(char not in allowed for char in normalized):
            raise ValueError("Hive ID may contain only letters, numbers, hyphen, and underscore")
        return normalized

    @field_validator("name", "species", "location")
    @classmethod
    def validate_optional_fields(cls, value: Optional[str]) -> Optional[str]:
        value = normalize_optional_text(value)
        if value and len(value) > 120:
            raise ValueError("Value must not exceed 120 characters")
        return value

class HiveCreate(HiveBase):
    pass

class Hive(HiveBase):
    id: int
    created_at: datetime
    harvests: List[HarvestRecord] = []
    inspections: List[InspectionRecord] = []

class WeatherDataBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    temp_c: float
    humidity: float
    location_name: Optional[str] = None
    location_name_th: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    wind_speed_mps: Optional[float] = None
    cloudiness_pct: Optional[float] = None
    source_name: Optional[str] = None

class WeatherData(WeatherDataBase):
    id: int
    timestamp: datetime


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=200)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    refresh_expires_in_seconds: int


class AuthUser(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=200)
    full_name: Optional[str] = None
    role: UserRole = UserRole.OPERATOR

class UserUpdate(BaseModel):
    password: Optional[str] = Field(None, min_length=8, max_length=200)
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None



