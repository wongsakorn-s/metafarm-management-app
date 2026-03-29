"""initial schema"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260329_0001"
down_revision = None
branch_labels = None
depends_on = None


hive_status = postgresql.ENUM("STRONG", "NORMAL", "WEAK", "EMPTY", name="hivestatus", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    hive_status.create(bind, checkfirst=True)

    op.create_table(
        "hives",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hive_id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("species", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("status", hive_status, nullable=False, server_default="NORMAL"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_hives_hive_id", "hives", ["hive_id"], unique=True)
    op.create_index("ix_hives_id", "hives", ["id"], unique=False)

    op.create_table(
        "weather_data",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("timestamp", sa.DateTime(), nullable=True),
        sa.Column("location_name", sa.String(), nullable=True),
        sa.Column("temp_c", sa.Float(), nullable=True),
        sa.Column("humidity", sa.Float(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("icon", sa.String(), nullable=True),
    )
    op.create_index("ix_weather_data_id", "weather_data", ["id"], unique=False)

    op.create_table(
        "harvest_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hive_id", sa.Integer(), sa.ForeignKey("hives.id"), nullable=False),
        sa.Column("harvest_date", sa.DateTime(), nullable=False),
        sa.Column("honey_yield_ml", sa.Float(), nullable=True),
        sa.Column("propolis_yield_g", sa.Float(), nullable=True),
    )
    op.create_index("ix_harvest_records_id", "harvest_records", ["id"], unique=False)

    op.create_table(
        "inspection_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("hive_id", sa.Integer(), sa.ForeignKey("hives.id"), nullable=False),
        sa.Column("inspection_date", sa.DateTime(), nullable=False),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("hive_status", hive_status, nullable=True),
    )
    op.create_index("ix_inspection_records_id", "inspection_records", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_inspection_records_id", table_name="inspection_records")
    op.drop_table("inspection_records")

    op.drop_index("ix_harvest_records_id", table_name="harvest_records")
    op.drop_table("harvest_records")

    op.drop_index("ix_weather_data_id", table_name="weather_data")
    op.drop_table("weather_data")

    op.drop_index("ix_hives_id", table_name="hives")
    op.drop_index("ix_hives_hive_id", table_name="hives")
    op.drop_table("hives")

    bind = op.get_bind()
    hive_status.drop(bind, checkfirst=True)
