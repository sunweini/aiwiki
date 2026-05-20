"""add current_stage to build_jobs

Revision ID: 7372ba58018e
Revises: d04039ea8057
Create Date: 2026-05-20 17:59:00.429188

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7372ba58018e'
down_revision: Union[str, None] = 'd04039ea8057'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('build_jobs', sa.Column('current_stage', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('build_jobs', 'current_stage')
