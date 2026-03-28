from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/harvests",
    tags=["harvests"]
)

@router.post("/", response_model=schemas.HarvestRecord)
def create_harvest(harvest: schemas.HarvestRecordCreate, hive_id_int: int, db: Session = Depends(database.get_db)):
    # Check if hive exists
    db_hive = db.query(models.Hive).filter(models.Hive.id == hive_id_int).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    new_harvest = models.HarvestRecord(**harvest.model_dump(), hive_id=hive_id_int)
    db.add(new_harvest)
    db.commit()
    db.refresh(new_harvest)
    return new_harvest

@router.get("/hive/{hive_id_int}", response_model=List[schemas.HarvestRecord])
def read_hive_harvests(hive_id_int: int, db: Session = Depends(database.get_db)):
    return db.query(models.HarvestRecord).filter(models.HarvestRecord.hive_id == hive_id_int).all()

@router.get("/", response_model=List[schemas.HarvestRecord])
def read_all_harvests(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.HarvestRecord).offset(skip).limit(limit).all()
