import logging
from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from PIL import Image
from .. import models, schemas, database
from ..auth import require_operator
from ..settings import settings
from ..storage import save_local_object, upload_supabase_object

router = APIRouter(
    prefix="/api/inspections",
    tags=["inspections"]
)

BASE_UPLOAD_DIR = settings.upload_dir
logger = logging.getLogger(__name__)
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def validate_uploaded_image(image_file: UploadFile) -> None:
    content_type = image_file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_file.file.seek(0, 2)
    size = image_file.file.tell()
    image_file.file.seek(0)
    if size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must not exceed 5 MB")


async def process_and_update_inspection_image(
    db_session_factory,
    inspection_id: int,
    image_bytes: bytes,
    hive_id: str
):
    """Background task to process image and update DB record."""
    db = db_session_factory()
    try:
        file_name = f"{uuid.uuid4()}.jpg"
        object_path = f"{hive_id}/{file_name}"
        
        # Process image (CPU intensive)
        output = BytesIO()
        img = Image.open(BytesIO(image_bytes))
        
        try:
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)
        except:
            pass
            
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
            
        max_size = (1200, 1200)
        img.thumbnail(max_size, Image.LANCZOS)
        img.save(output, "JPEG", quality=80, optimize=True)
        processed_bytes = output.getvalue()

        # Save to storage (Network IO)
        if settings.supabase_storage_enabled:
            image_url = await upload_supabase_object(object_path, processed_bytes, "image/jpeg")
        else:
            image_url = save_local_object(object_path, processed_bytes)

        # Update DB
        inspection = db.query(models.InspectionRecord).filter(models.InspectionRecord.id == inspection_id).first()
        if inspection:
            inspection.image_url = image_url
            db.commit()
            logger.info("Successfully processed background image for inspection_id=%s", inspection_id)
    except Exception:
        logger.exception("Failed background image processing for inspection_id=%s", inspection_id)
    finally:
        db.close()


@router.post("/", response_model=schemas.InspectionRecord)
async def create_inspection(
    background_tasks: BackgroundTasks,
    hive_id_int: int = Form(...),
    notes: Optional[str] = Form(None),
    status: Optional[models.HiveStatus] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_operator),
):
    db_hive = db.query(models.Hive).filter(models.Hive.id == hive_id_int).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    validated_notes = schemas.InspectionRecordCreate(notes=notes, hive_status=status).notes
    
    # 1. บันทึกข้อมูลการตรวจรังเบื้องต้นก่อน (ยังไม่มีรูป)
    new_inspection = models.InspectionRecord(
        hive_id=hive_id_int,
        notes=validated_notes,
        hive_status=status or db_hive.status,
        image_url=None 
    )
    
    if status:
        db_hive.status = status
        
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    # 2. ถ้ามีการส่งรูปมา ให้ส่งไปประมวลผลใน Background
    if image:
        validate_uploaded_image(image)
        image_content = await image.read()
        background_tasks.add_task(
            process_and_update_inspection_image,
            database.SessionLocal,
            new_inspection.id,
            image_content,
            db_hive.hive_id
        )

    return new_inspection

@router.get("/hive/{hive_id_int}", response_model=List[schemas.InspectionRecord])
def read_hive_inspections(
    hive_id_int: int,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_operator),
):
    return (
        db.query(models.InspectionRecord)
        .filter(models.InspectionRecord.hive_id == hive_id_int)
        .order_by(models.InspectionRecord.inspection_date.desc())
        .limit(limit)
        .all()
    )
