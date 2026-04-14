import logging
import uuid
from io import BytesIO
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from .. import database, models, schemas
from ..auth import require_operator, require_viewer
from ..settings import settings
from ..storage import save_local_object, upload_supabase_object

router = APIRouter(
    prefix="/api/inspections",
    tags=["inspections"],
)

logger = logging.getLogger(__name__)
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def validate_uploaded_image(image_file: UploadFile, image_bytes: bytes) -> None:
    content_type = image_file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must not exceed 5 MB")

    try:
        uploaded_image = Image.open(BytesIO(image_bytes))
        uploaded_image.verify()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image") from exc


async def process_and_update_inspection_image(
    db_session_factory,
    inspection_id: int,
    image_bytes: bytes,
    hive_id: str,
):
    db = db_session_factory()
    try:
        file_name = f"{uuid.uuid4()}.jpg"
        object_path = f"{hive_id}/{file_name}"

        output = BytesIO()
        image = Image.open(BytesIO(image_bytes))

        try:
            from PIL import ImageOps

            image = ImageOps.exif_transpose(image)
        except Exception:
            pass

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        image.thumbnail((1200, 1200), Image.LANCZOS)
        image.save(output, "JPEG", quality=80, optimize=True)
        processed_bytes = output.getvalue()

        if settings.supabase_storage_enabled:
            image_url = await upload_supabase_object(object_path, processed_bytes, "image/jpeg")
        else:
            image_url = save_local_object(object_path, processed_bytes)

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
    image_content: bytes | None = None
    if image:
        image_content = await image.read()
        validate_uploaded_image(image, image_content)

    new_inspection = models.InspectionRecord(
        hive_id=hive_id_int,
        notes=validated_notes,
        hive_status=status or db_hive.status,
        image_url=None,
    )

    if status:
        db_hive.status = status

    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    if image_content is not None:
        background_tasks.add_task(
            process_and_update_inspection_image,
            database.SessionLocal,
            new_inspection.id,
            image_content,
            db_hive.hive_id,
        )

    return new_inspection


@router.get("/hive/{hive_id_int}", response_model=List[schemas.InspectionRecord])
def read_hive_inspections(
    hive_id_int: int,
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_viewer),
):
    return (
        db.query(models.InspectionRecord)
        .filter(models.InspectionRecord.hive_id == hive_id_int)
        .order_by(models.InspectionRecord.inspection_date.desc())
        .limit(limit)
        .all()
    )
