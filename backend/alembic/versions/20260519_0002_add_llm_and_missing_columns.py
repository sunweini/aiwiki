"""Add LLM fields to knowledge_bases + missing columns on sources/build_jobs.

Revision ID: 20260519_0002
Revises: 20260519_0001
"""

from alembic import op
import sqlalchemy as sa

revision = "20260519_0002"
down_revision = "20260519_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # sources: add missing timestamp columns that exist in the model
    op.add_column("sources", sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("sources", sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("sources", sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True))

    # knowledge_bases: add description, release_policy, and LLM config fields
    op.add_column("knowledge_bases", sa.Column("description", sa.String(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("release_policy", sa.JSON(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("llm_backend", sa.String(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("llm_api_key_ref", sa.String(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("llm_model_override", sa.String(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("llm_extraction_budget", sa.Integer(), nullable=True))
    op.add_column("knowledge_bases", sa.Column("llm_base_url_override", sa.String(), nullable=True))

    # build_jobs: add finished_at
    op.add_column("build_jobs", sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("build_jobs", "finished_at")
    op.drop_column("knowledge_bases", "llm_base_url_override")
    op.drop_column("knowledge_bases", "llm_extraction_budget")
    op.drop_column("knowledge_bases", "llm_model_override")
    op.drop_column("knowledge_bases", "llm_api_key_ref")
    op.drop_column("knowledge_bases", "llm_backend")
    op.drop_column("knowledge_bases", "release_policy")
    op.drop_column("knowledge_bases", "description")
    op.drop_column("sources", "last_synced_at")
    op.drop_column("sources", "updated_at")
    op.drop_column("sources", "created_at")
