from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, database
from ..auth import require_viewer

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/public-stats")
def get_public_stats(db: Session = Depends(database.get_db)):
    """Public stats for landing page (No Auth)"""
    total_hives = db.query(models.Hive).count()
    total_yields = db.query(
        func.sum(models.HarvestRecord.honey_yield_ml).label("total_honey"),
        func.sum(models.HarvestRecord.propolis_yield_g).label("total_propolis")
    ).first()
    
    return {
        "total_hives": total_hives,
        "total_honey_ml": total_yields.total_honey or 0,
        "total_propolis_g": total_yields.total_propolis or 0,
    }

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(require_viewer),
):
    total_hives = db.query(models.Hive).count()
    status_summary = db.query(
        models.Hive.status, func.count(models.Hive.status)
    ).group_by(models.Hive.status).all()

    status_dict = {status.value: count for status, count in status_summary}
    total_yields = db.query(
        func.sum(models.HarvestRecord.honey_yield_ml).label("total_honey"),
        func.sum(models.HarvestRecord.propolis_yield_g).label("total_propolis")
    ).first()

    recent_rows = (
        db.query(
            models.HarvestRecord.id,
            models.HarvestRecord.harvest_date,
            models.HarvestRecord.honey_yield_ml,
            models.HarvestRecord.propolis_yield_g,
            models.Hive.hive_id,
            models.Hive.name,
        )
        .join(models.Hive, models.Hive.id == models.HarvestRecord.hive_id)
        .order_by(models.HarvestRecord.harvest_date.desc())
        .limit(5)
        .all()
    )

    recent_list = [
        {
            "id": row.id,
            "hive_name": row.name or row.hive_id,
            "date": row.harvest_date,
            "honey": row.honey_yield_ml,
            "propolis": row.propolis_yield_g,
        }
        for row in recent_rows
    ]

    return {
        "total_hives": total_hives,
        "status_summary": status_dict,
        "total_honey_ml": total_yields.total_honey or 0,
        "total_propolis_g": total_yields.total_propolis or 0,
        "recent_harvests": recent_list
    }
