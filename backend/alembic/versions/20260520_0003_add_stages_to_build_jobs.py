"""Add stages JSON column to build_jobs.

Revision ID: 20260520_0003
Revises: 20260519_0002
"""

from alembic import op
import sqlalchemy as sa

revision = "20260520_0003"
down_revision = "20260519_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("build_jobs", sa.Column("stages", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("build_jobs", "stages")
