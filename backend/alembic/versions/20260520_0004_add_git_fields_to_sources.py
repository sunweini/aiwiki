"""add git fields to sources

Revision ID: d04039ea8057
Revises: 20260520_0003
Create Date: 2026-05-20 17:54:53.238445

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'd04039ea8057'
down_revision: Union[str, None] = '20260520_0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('sources', sa.Column('git_tracking_branch', sa.String(), nullable=False))
    op.add_column('sources', sa.Column('git_poll_interval_minutes', sa.Integer(), nullable=False))
    op.add_column('sources', sa.Column('git_last_commit', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('sources', 'git_last_commit')
    op.drop_column('sources', 'git_poll_interval_minutes')
    op.drop_column('sources', 'git_tracking_branch')
