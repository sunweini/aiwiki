from alembic import op
import sqlalchemy as sa

revision = "20260519_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
    )
    op.create_table(
        "sources",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("source_ref", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("auth_config", sa.JSON(), nullable=False),
        sa.Column("sync_strategy", sa.String(), nullable=False),
        sa.Column("include_rules", sa.JSON(), nullable=False),
        sa.Column("exclude_rules", sa.JSON(), nullable=False),
        sa.Column("normalization_options", sa.JSON(), nullable=False),
    )
    op.create_table(
        "knowledge_bases",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("visibility", sa.String(), nullable=False),
        sa.Column("active_release_id", sa.String(), sa.ForeignKey("releases.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "build_jobs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("knowledge_base_id", sa.String(), sa.ForeignKey("knowledge_bases.id"), nullable=False),
        sa.Column("build_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("release_id", sa.String(), sa.ForeignKey("releases.id"), nullable=True),
        sa.Column("error_summary", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "knowledge_base_source_bindings",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("knowledge_base_id", sa.String(), sa.ForeignKey("knowledge_bases.id"), nullable=False),
        sa.Column("source_id", sa.String(), sa.ForeignKey("sources.id"), nullable=False),
        sa.Column("binding_status", sa.String(), nullable=False),
        sa.Column("scope_override", sa.JSON(), nullable=False),
        sa.Column("include_rules_override", sa.JSON(), nullable=False),
        sa.Column("exclude_rules_override", sa.JSON(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
    )
    op.create_table(
        "releases",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("knowledge_base_id", sa.String(), sa.ForeignKey("knowledge_bases.id"), nullable=False),
        sa.Column("build_job_id", sa.String(), sa.ForeignKey("build_jobs.id"), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("artifact_status", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "artifact_versions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("release_id", sa.String(), sa.ForeignKey("releases.id"), nullable=False),
        sa.Column("artifact_type", sa.String(), nullable=False),
        sa.Column("artifact_status", sa.String(), nullable=False),
        sa.Column("artifact_path", sa.String(), nullable=False),
        sa.Column("artifact_meta", sa.JSON(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("artifact_versions")
    op.drop_table("releases")
    op.drop_table("knowledge_base_source_bindings")
    op.drop_table("build_jobs")
    op.drop_table("knowledge_bases")
    op.drop_table("sources")
    op.drop_table("projects")
