from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class HiveStatus(str, enum.Enum):
    STRONG = "Strong"
    NORMAL = "Normal"
    WEAK = "Weak"
    EMPTY = "Empty"

class Hive(Base):
    __tablename__ = "hives"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    species = Column(String, nullable=True) # Added for stingless bee species
    location = Column(String, nullable=True) # Added for hive location
    status = Column(Enum(HiveStatus), default=HiveStatus.NORMAL, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to HarvestRecords
    harvests = relationship("HarvestRecord", back_populates="hive", cascade="all, delete-orphan")
    inspections = relationship("InspectionRecord", back_populates="hive", cascade="all, delete-orphan")

class HarvestRecord(Base):
    __tablename__ = "harvest_records"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"), nullable=False)
    harvest_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    honey_yield_ml = Column(Float, default=0.0)
    propolis_yield_g = Column(Float, default=0.0)

    # Relationship to Hive
    hive = relationship("Hive", back_populates="harvests")

class InspectionRecord(Base):
    __tablename__ = "inspection_records"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"), nullable=False)
    inspection_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(String, nullable=True)
    image_url = Column(String, nullable=True) # Path to the stored image
    hive_status = Column(Enum(HiveStatus), nullable=True)

    # Relationship to Hive
    hive = relationship("Hive", back_populates="inspections")

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location_name = Column(String, nullable=True) # Added for area name
    temp_c = Column(Float)
    humidity = Column(Float)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)

