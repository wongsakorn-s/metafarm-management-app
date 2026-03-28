from __future__ import annotations

from datetime import UTC, datetime, timedelta

from app.database import SessionLocal
from app.models import HarvestRecord, Hive, HiveStatus, InspectionRecord


def seed_sample_data() -> None:
    db = SessionLocal()

    try:
        existing = db.query(Hive).count()
        if existing > 0:
            print(f"Skip seeding: found {existing} existing hives.")
            return

        now = datetime.now(UTC).replace(tzinfo=None)

        hive_specs = [
            {
                "hive_id": "HIVE-001",
                "name": "North Garden A",
                "species": "Tetragonula laeviceps",
                "location": "North Garden",
                "status": HiveStatus.STRONG,
            },
            {
                "hive_id": "HIVE-002",
                "name": "Longan Row 1",
                "species": "Lepidotrigona terminata",
                "location": "Longan Orchard",
                "status": HiveStatus.NORMAL,
            },
            {
                "hive_id": "HIVE-003",
                "name": "Herb Corner",
                "species": "Tetragonula pagdeni",
                "location": "Herb Plot",
                "status": HiveStatus.STRONG,
            },
            {
                "hive_id": "HIVE-004",
                "name": "Pond Edge",
                "species": "Homotrigona fimbriata",
                "location": "Pond Side",
                "status": HiveStatus.WEAK,
            },
            {
                "hive_id": "HIVE-005",
                "name": "Nursery Shade",
                "species": "Tetragonula laeviceps",
                "location": "Seedling House",
                "status": HiveStatus.NORMAL,
            },
            {
                "hive_id": "HIVE-006",
                "name": "Spare Box",
                "species": "Tetragonula pagdeni",
                "location": "Storage Area",
                "status": HiveStatus.EMPTY,
            },
        ]

        hives: list[Hive] = []
        for index, spec in enumerate(hive_specs):
            hive = Hive(
                **spec,
                created_at=now - timedelta(days=60 - (index * 4)),
            )
            db.add(hive)
            hives.append(hive)

        db.flush()

        harvest_specs = [
            (hives[0], [(12, 420, 28), (26, 360, 21), (41, 310, 18)]),
            (hives[1], [(10, 210, 14), (30, 185, 11)]),
            (hives[2], [(8, 390, 25), (22, 340, 20), (38, 295, 16)]),
            (hives[3], [(18, 80, 5)]),
            (hives[4], [(15, 170, 12), (35, 140, 9)]),
        ]

        for hive, records in harvest_specs:
            for days_ago, honey, propolis in records:
                db.add(
                    HarvestRecord(
                        hive_id=hive.id,
                        harvest_date=now - timedelta(days=days_ago, hours=8),
                        honey_yield_ml=honey,
                        propolis_yield_g=propolis,
                    )
                )

        inspection_specs = [
            (hives[0], [(4, "Brood pattern looks strong and pollen pots are full.", HiveStatus.STRONG)]),
            (
                hives[1],
                [
                    (6, "Hive entrance active in the morning. Honey pots developing well.", HiveStatus.NORMAL),
                    (20, "Added shade cover due to direct afternoon sun.", HiveStatus.NORMAL),
                ],
            ),
            (hives[2], [(3, "Very active foragers and stable nest temperature.", HiveStatus.STRONG)]),
            (
                hives[3],
                [
                    (2, "Low activity observed. Recommend checking food sources nearby.", HiveStatus.WEAK),
                    (14, "Reduced brood area after heavy rain week.", HiveStatus.WEAK),
                ],
            ),
            (hives[4], [(5, "Normal activity with moderate resin collection.", HiveStatus.NORMAL)]),
            (hives[5], [(1, "Empty box prepared for colony split next cycle.", HiveStatus.EMPTY)]),
        ]

        for hive, records in inspection_specs:
            for days_ago, notes, status in records:
                db.add(
                    InspectionRecord(
                        hive_id=hive.id,
                        inspection_date=now - timedelta(days=days_ago, hours=7),
                        notes=notes,
                        hive_status=status,
                    )
                )

        db.commit()
        print(f"Seeded {len(hives)} hives with harvest and inspection records.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_data()
