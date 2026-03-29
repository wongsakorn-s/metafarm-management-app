import logging
from io import BytesIO

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from PIL import Image
from .. import models, schemas, database
from ..auth import require_write_access
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

def build_processed_image(image_file: UploadFile) -> bytes:
    """Resize and compress image to JPEG bytes."""
    output = BytesIO()

    file_name = f"{uuid.uuid4()}.jpg"
    img = Image.open(image_file.file)

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
    image_file.file.seek(0)
    return output.getvalue()


async def process_and_save_image(image_file: UploadFile, hive_id: str) -> str:
    file_name = f"{uuid.uuid4()}.jpg"
    object_path = f"{hive_id}/{file_name}"
    image_bytes = build_processed_image(image_file)

    if settings.supabase_storage_enabled:
        return await upload_supabase_object(object_path, image_bytes, "image/jpeg")

    return save_local_object(object_path, image_bytes)

@router.post("/", response_model=schemas.InspectionRecord)
async def create_inspection(
    hive_id_int: int = Form(...),
    notes: Optional[str] = Form(None),
    status: Optional[models.HiveStatus] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(database.get_db),
    _: None = Depends(require_write_access),
):
    db_hive = db.query(models.Hive).filter(models.Hive.id == hive_id_int).first()
    if not db_hive:
        raise HTTPException(status_code=404, detail="Hive not found")

    validated_notes = schemas.InspectionRecordCreate(notes=notes, hive_status=status).notes
    
    image_url = None
    if image:
        try:
            validate_uploaded_image(image)
            image_url = await process_and_save_image(image, db_hive.hive_id)
        except Exception as e:
            logger.exception("Failed to process inspection image for hive_id=%s", db_hive.hive_id)
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(status_code=400, detail="Failed to process inspection image") from e

    new_inspection = models.InspectionRecord(
        hive_id=hive_id_int,
        notes=validated_notes,
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
def read_hive_inspections(
    hive_id_int: int,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(database.get_db),
):
    return (
        db.query(models.InspectionRecord)
        .filter(models.InspectionRecord.hive_id == hive_id_int)
        .order_by(models.InspectionRecord.inspection_date.desc())
        .limit(limit)
        .all()
    )
