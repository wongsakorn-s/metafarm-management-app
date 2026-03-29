from datetime import UTC, datetime
import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utcnow() -> datetime:
    return datetime.now(UTC)


class HiveStatus(str, enum.Enum):
    STRONG = "Strong"
    NORMAL = "Normal"
    WEAK = "Weak"
    EMPTY = "Empty"


class UserRole(str, enum.Enum):
    ADMIN = "admin"


class Hive(Base):
    __tablename__ = "hives"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    species = Column(String, nullable=True)
    location = Column(String, nullable=True)
    status = Column(Enum(HiveStatus), default=HiveStatus.NORMAL, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    harvests = relationship("HarvestRecord", back_populates="hive", cascade="all, delete-orphan")
    inspections = relationship("InspectionRecord", back_populates="hive", cascade="all, delete-orphan")


class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"), nullable=False)
    harvest_date = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    honey_yield_ml = Column(Float, default=0.0)
    propolis_yield_g = Column(Float, default=0.0)
    hive = relationship("Hive", back_populates="harvests")


class InspectionRecord(Base):
    __tablename__ = "inspection_records"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"), nullable=False)
    inspection_date = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    notes = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    hive_status = Column(Enum(HiveStatus), nullable=True)
    hive = relationship("Hive", back_populates="inspections")


class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
    location_name = Column(String, nullable=True)
    temp_c = Column(Float)
    humidity = Column(Float)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.ADMIN, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_jti = Column(String, unique=True, nullable=False, index=True)
    token_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="refresh_tokens")

