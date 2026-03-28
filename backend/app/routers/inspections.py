from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
from PIL import Image
import io
from .. import models, schemas, database

router = APIRouter(
    prefix="/api/inspections",
    tags=["inspections"]
)

BASE_UPLOAD_DIR = "static/uploads"

def process_and_save_image(image_file: UploadFile, hive_id: str) -> str:
    """Resizes, compresses, and saves an image to a hive-specific folder."""
    # Create hive-specific directory
    hive_dir = os.path.join(BASE_UPLOAD_DIR, hive_id)
    if not os.path.exists(hive_dir):
        os.makedirs(hive_dir, exist_ok=True)

    # Generate unique filename (convert to .jpg for efficiency)
    file_name = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(hive_dir, file_name)

    # Open image using Pillow
    img = Image.open(image_file.file)
    
    # Fix orientation based on EXIF (crucial for mobile photos)
    try:
        from PIL import ImageOps
        img = ImageOps.exif_transpose(img)
    except:
        pass

    # Convert to RGB if necessary (e.g., from PNG with transparency)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # Resize if too large (max 1200px width/height)
    max_size = (1200, 1200)
    img.thumbnail(max_size, Image.LANCZOS)

    # Save with compression (80% quality is a good balance)
    img.save(file_path, "JPEG", quality=80, optimize=True)
    
    # Return relative URL for storage in DB
    return f"/static/uploads/{hive_id}/{file_name}"

@router.post("/", response_model=schemas.InspectionRecord)
async def create_inspection(
    hive_id_int: int = Form(...),
    notes: Optional[str] = Form(None),
    status: Optional[models.HiveStatus] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db)
):
    db_hive = db.query(models.Hive).filter(models.Hive.id == hive_id_int).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    image_url = None
    if image:
        try:
            image_url = process_and_save_image(image, db_hive.hive_id)
        except Exception as e:
            # Fallback or log error
            print(f"Error processing image: {e}")
            # Optional: You could still save raw if processing fails, 
            # but usually it's better to catch it.

    new_inspection = models.InspectionRecord(
        hive_id=hive_id_int,
        notes=notes,
        hive_status=status or db_hive.status,
        image_url=image_url
    )
    
    if status:
        db_hive.status = status
        
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)
    return new_inspection

@router.get("/hive/{hive_id_int}", response_model=List[schemas.InspectionRecord])
def read_hive_inspections(hive_id_int: int, db: Session = Depends(database.get_db)):
    return db.query(models.InspectionRecord).filter(models.InspectionRecord.hive_id == hive_id_int).order_by(models.InspectionRecord.inspection_date.desc()).all()
