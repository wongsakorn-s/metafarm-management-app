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
    # Total Hives
    total_hives = db.query(models.Hive).count()
    
    # Status Counts
    status_summary = db.query(
        models.Hive.status, func.count(models.Hive.status)
    ).group_by(models.Hive.status).all()
    
    status_dict = {status.value: count for status, count in status_summary}
    
    # Total Yields
    total_yields = db.query(
        func.sum(models.HarvestRecord.honey_yield_ml).label("total_honey"),
        func.sum(models.HarvestRecord.propolis_yield_g).label("total_propolis")
    ).first()
    
    # Recent Harvests (Last 5)
    recent_harvests = db.query(models.HarvestRecord).order_by(
        models.HarvestRecord.harvest_date.desc()
    ).limit(5).all()
    
    # Format recent harvests to include hive info
    recent_list = []
    for h in recent_harvests:
        hive = db.query(models.Hive).filter(models.Hive.id == h.hive_id).first()
        recent_list.append({
            "id": h.id,
            "hive_name": (hive.name if hive else h.hive_id) or h.hive_id,
            "date": h.harvest_date,
            "honey": h.honey_yield_ml,
            "propolis": h.propolis_yield_g
        })

    return {
        "total_hives": total_hives,
        "status_summary": status_dict,
        "total_honey_ml": total_yields.total_honey or 0,
        "total_propolis_g": total_yields.total_propolis or 0,
        "recent_harvests": recent_list
    }
