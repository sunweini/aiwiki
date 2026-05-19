export interface Project {
  id: string;
  name: string;
  description: string | null;
}

export interface Source {
  id: string;
  project_id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  source_ref: string;
  description: string | null;
  auth_config: Record<string, unknown>;
  sync_strategy: SyncStrategy;
  include_rules: string[];
  exclude_rules: string[];
  normalization_options: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SourceType = "github_repo" | "gitlab_repo" | "doc_site" | "markdown_dir" | "confluence_space";

export type SourceStatus = "active" | "inactive" | "error" | "syncing";

export type SyncStrategy = "webhook" | "polling" | "manual";

export interface KnowledgeBase {
  id: string;
  project_id: string;
  name: string;
  status: KBStatus;
  visibility: Visibility;
  active_release_id: string | null;
  description: string | null;
  release_policy: ReleasePolicy;
  llm_backend: string | null;
  llm_api_key_ref: string | null;
  llm_model_override: string | null;
  llm_extraction_budget: number | null;
  llm_base_url_override: string | null;
  created_at: string;
  updated_at: string;
}

export type KBStatus = "ready" | "building" | "error" | "empty";

export type Visibility = "private" | "org_shared" | "public";

export interface ReleasePolicy {
  activation_mode: "auto_activate" | "manual_review";
}

export interface KnowledgeBaseSourceBinding {
  id: string;
  knowledge_base_id: string;
  source_id: string;
  binding_status: BindingStatus;
  scope_override: Record<string, unknown>;
  include_rules_override: string[];
  exclude_rules_override: string[];
  priority: number;
}

export type BindingStatus = "active" | "inactive" | "error";

export interface BuildJob {
  job_id: string;
  knowledge_base_id: string;
  build_type: BuildType;
  status: BuildStatus;
  release_id: string | null;
  triggered_by: string;
  reason: string | null;
  started_at: string;
  finished_at: string | null;
  error_summary: string | null;
  stages: BuildStage[];
}

export type BuildType = "full_rebuild" | "incremental_update";

export type BuildStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface BuildStage {
  name: string;
  status: BuildStatus;
  started_at: string | null;
  finished_at: string | null;
  log: string;
}

export interface Release {
  id: string;
  knowledge_base_id: string;
  build_job_id: string;
  version: string;
  status: ReleaseStatus;
  artifact_status: Record<string, ArtifactStatus>;
  created_at: string;
}

export type ReleaseStatus = "draft" | "ready" | "active" | "superseded" | "failed";

export type ArtifactStatus = "missing" | "building" | "ready" | "error";

export interface ArtifactVersion {
  id: string;
  release_id: string;
  artifact_type: ArtifactType;
  artifact_status: ArtifactStatus;
  artifact_path: string;
  artifact_meta: Record<string, unknown>;
}

export type ArtifactType = "graph" | "html" | "vault" | "obsidian_vault" | "metadata_index" | "report" | "wiki" | "svg" | "graphml" | "canvas" | "cypher" | "logs";

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface MCPKBStatus {
  kb_id: string;
  status: string;
  active_release_id: string | null;
  graph_status: ArtifactStatus;
  vault_status?: ArtifactStatus;
  last_build_job_id?: string | null;
  last_build_at?: string | null;
  artifact_status?: Record<string, ArtifactStatus>;
}

export interface KnowledgeBaseSummary {
  id?: string;
  kb_id?: string;
  name: string;
  project_id: string;
  status: KBStatus | string;
  active_release_id: string | null;
  visibility?: string;
  description?: string | null;
  llm_backend?: string | null;
  llm_api_key_ref?: string | null;
  llm_model_override?: string | null;
  llm_extraction_budget?: number | null;
  llm_base_url_override?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface KBListResponse {
  items: KnowledgeBaseSummary[];
}

export interface ArtifactsBundle {
  kb_id: string;
  release_id: string | null;
  artifacts: ArtifactVersion[];
}

export interface MCPQueryResult {
  kb_id: string;
  release_id: string | null;
  answer: string;
  source_locations: string[];
  artifact_refs: Record<string, string>;
  updated_at?: string;
}

export interface DashboardStats {
  project_count: number;
  source_count: number;
  kb_count: number;
  active_build_count: number;
  recent_builds: BuildJob[];
  recent_releases: Release[];
}
