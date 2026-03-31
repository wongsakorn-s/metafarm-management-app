"""add roles and indexes

Revision ID: 20260401_0003
Revises: 20260329_0002
Create Date: 2026-04-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260401_0003'
down_revision = '20260329_0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Add new roles to ENUM (PostgreSQL specific approach)
    # Note: ALTER TYPE cannot run inside a transaction block in some PG versions
    # but Alembic usually handles this or we can use op.execute with COMMIT
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Add OPERATOR and VIEWER to userrole enum
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'OPERATOR'")
        op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'VIEWER'")

    # 2. Add indexes to date columns for performance
    op.create_index(
        "ix_harvest_records_harvest_date", 
        "harvest_records", 
        ["harvest_date"], 
        unique=False
    )
    op.create_index(
        "ix_inspection_records_inspection_date", 
        "inspection_records", 
        ["inspection_date"], 
        unique=False
    )


def downgrade() -> None:
    # Remove indexes
    op.drop_index("ix_inspection_records_inspection_date", table_name="inspection_records")
    op.drop_index("ix_harvest_records_harvest_date", table_name="harvest_records")
    
    # Note: Removing values from an ENUM is complex in PostgreSQL 
    # and usually not recommended in a simple migration.
    # We will leave the enum values as is for downgrade safety.
    pass
