from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/hives",
    tags=["hives"]
)

@router.post("/", response_model=schemas.Hive)
def create_hive(hive: schemas.HiveCreate, db: Session = Depends(database.get_db)):
    db_hive = db.query(models.Hive).filter(models.Hive.hive_id == hive.hive_id).first()
    if db_hive:
        raise HTTPException(status_code=400, detail="Hive ID already registered")
    new_hive = models.Hive(**hive.model_dump())
    db.add(new_hive)
    db.commit()
    db.refresh(new_hive)
    return new_hive

@router.get("/", response_model=List[schemas.Hive])
def read_hives(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Hive).offset(skip).limit(limit).all()

@router.get("/{hive_id}", response_model=schemas.Hive)
def read_hive(hive_id: str, db: Session = Depends(database.get_db)):
    db_hive = db.query(models.Hive).filter(models.Hive.hive_id == hive_id).first()
    if db_hive is None:
        raise HTTPException(status_code=404, detail="Hive not found")
    return db_hive

@router.put("/{hive_id}", response_model=schemas.Hive)
def update_hive(hive_id: str, hive_update: schemas.HiveCreate, db: Session = Depends(database.get_db)):
    db_hive = db.query(models.Hive).filter(models.Hive.hive_id == hive_id).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    for key, value in hive_update.model_dump().items():
        setattr(db_hive, key, value)
    
    db.commit()
    db.refresh(db_hive)
    return db_hive

@router.delete("/{hive_id}")
def delete_hive(hive_id: str, db: Session = Depends(database.get_db)):
    db_hive = db.query(models.Hive).filter(models.Hive.hive_id == hive_id).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    db.delete(db_hive)
    db.commit()
    return {"message": "Hive deleted successfully"}