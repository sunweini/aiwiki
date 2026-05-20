from alembic import op
import sqlalchemy as sa

revision = "20260519_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. projects (no FKs)
    op.create_table(
        "projects",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
    )
    # 2. sources (FK to projects)
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
    # 3. knowledge_bases (without circular FK to releases yet)
    op.create_table(
        "knowledge_bases",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("visibility", sa.String(), nullable=False),
        sa.Column("active_release_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    # 4. build_jobs (without circular FK to releases yet)
    op.create_table(
        "build_jobs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("knowledge_base_id", sa.String(), sa.ForeignKey("knowledge_bases.id"), nullable=False),
        sa.Column("build_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("release_id", sa.String(), nullable=True),
        sa.Column("error_summary", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
    )
    # 5. knowledge_base_source_bindings
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
    # 6. releases (FKs to kb and build_jobs — both exist now)
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
    # 7. artifact_versions (FK to releases)
    op.create_table(
        "artifact_versions",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("release_id", sa.String(), sa.ForeignKey("releases.id"), nullable=False),
        sa.Column("artifact_type", sa.String(), nullable=False),
        sa.Column("artifact_status", sa.String(), nullable=False),
        sa.Column("artifact_path", sa.String(), nullable=False),
        sa.Column("artifact_meta", sa.JSON(), nullable=False),
    )
    # 8. Add deferred FKs: knowledge_bases.active_release_id → releases
    op.create_foreign_key(None, "knowledge_bases", "releases", ["active_release_id"], ["id"])
    # 9. Add deferred FKs: build_jobs.release_id → releases
    op.create_foreign_key(None, "build_jobs", "releases", ["release_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint(None, "build_jobs", type_="foreignkey")
    op.drop_constraint(None, "knowledge_bases", type_="foreignkey")
    op.drop_table("artifact_versions")
    op.drop_table("releases")
    op.drop_table("knowledge_base_source_bindings")
    op.drop_table("build_jobs")
    op.drop_table("knowledge_bases")
    op.drop_table("sources")
    op.drop_table("projects")
