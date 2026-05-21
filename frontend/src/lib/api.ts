import type {
  ArtifactVersion,
  ArtifactsBundle,
  BuildJob,
  DashboardStats,
  KBListResponse,
  KnowledgeBase,
  KnowledgeBaseSourceBinding,
  KnowledgeBaseSummary,
  MCPKBStatus,
  MCPQueryResult,
  PaginatedResponse,
  Project,
  Release,
  Source,
} from "./types";
import {
  MOCK_ARTIFACTS,
  MOCK_BINDINGS,
  MOCK_BUILD_JOBS,
  MOCK_DASHBOARD_STATS,
  MOCK_KNOWLEDGE_BASES,
  MOCK_MCP_QUERY_RESULT,
  MOCK_MCP_STATUS,
  MOCK_RELEASES,
  MOCK_SOURCES,
} from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export const apiBase = API_BASE;

export function resolveArtifactUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// --- Projects ---

export async function listProjects(): Promise<PaginatedResponse<Project>> {
  return fetchJSON<PaginatedResponse<Project>>("/api/projects");
}

// --- Sources ---

export async function listSources(projectId: string): Promise<PaginatedResponse<Source>> {
  return fetchJSON<PaginatedResponse<Source>>(`/api/projects/${projectId}/sources`);
}

export async function getSource(projectId: string, sourceId: string): Promise<Source> {
  return fetchJSON<Source>(`/api/projects/${projectId}/sources/${sourceId}`);
}

export async function createSource(projectId: string, data: Partial<Source>): Promise<Source> {
  return fetchJSON<Source>(`/api/projects/${projectId}/sources`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Knowledge Bases ---

export async function fetchKnowledgeBases(projectId: string): Promise<KnowledgeBaseSummary[]> {
  const page = await fetchJSON<PaginatedResponse<any>>(`/api/projects/${projectId}/knowledge-bases`);
  return (page.items ?? []).map((item: any) => ({
    ...item,
    kb_id: item.kb_id ?? item.id,
  }));
}

export async function fetchKnowledgeBase(kbId: string): Promise<KnowledgeBaseSummary | null> {
  try {
    const kb = await fetchJSON<KnowledgeBaseSummary>(`/api/knowledge-bases/${kbId}`);
    return { ...kb, kb_id: kb.kb_id ?? kb.id };
  } catch {
    return null;
  }
}

export async function fetchReleases(kbId: string): Promise<Release[]> {
  const page = await fetchJSON<PaginatedResponse<Release>>(`/api/knowledge-bases/${kbId}/releases`);
  return page.items ?? [];
}

export async function fetchArtifacts(kbId: string): Promise<ArtifactsBundle> {
  return fetchJSON<ArtifactsBundle>(`/api/knowledge-bases/${kbId}/artifacts`);
}

export async function fetchKBStatus(kbId: string): Promise<MCPKBStatus> {
  return fetchJSON<MCPKBStatus>("/mcp/kb_status", {
    method: "POST",
    body: JSON.stringify({ kb_id: kbId }),
  });
}

// Legacy aliases retained for callers that import the older names.
export async function listKnowledgeBases(projectId: string): Promise<{ items: KnowledgeBaseSummary[] }> {
  return { items: await fetchKnowledgeBases(projectId) };
}

export async function getKnowledgeBase(kbId: string): Promise<KnowledgeBaseSummary | null> {
  return fetchKnowledgeBase(kbId);
}

export async function createKnowledgeBase(projectId: string, data: Partial<KnowledgeBase>): Promise<KnowledgeBase> {
  return fetchJSON<KnowledgeBase>(`/api/projects/${projectId}/knowledge-bases`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Bindings ---

export async function listBindings(kbId: string): Promise<PaginatedResponse<KnowledgeBaseSourceBinding>> {
  return fetchJSON<PaginatedResponse<KnowledgeBaseSourceBinding>>(`/api/knowledge-bases/${kbId}/bindings`);
}

export async function createBinding(kbId: string, data: Partial<KnowledgeBaseSourceBinding>): Promise<KnowledgeBaseSourceBinding> {
  return fetchJSON<KnowledgeBaseSourceBinding>(`/api/knowledge-bases/${kbId}/bindings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Build Jobs ---

export async function listBuildJobs(
  kbId: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<BuildJob>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return fetchJSON<PaginatedResponse<BuildJob>>(`/api/knowledge-bases/${kbId}/builds?${params.toString()}`);
}

export async function getBuildJob(jobId: string): Promise<BuildJob> {
  return fetchJSON<BuildJob>(`/api/build-jobs/${jobId}`);
}

export async function listAllBuildJobs(): Promise<BuildJob[]> {
  const list = await mcpKBList();
  const allBuilds = await Promise.all(
    list.items.filter((kb) => kb.kb_id != null).map(async (kb) => {
      try {
        const page = await listBuildJobs(kb.kb_id!, 1, 20);
        return page.items;
      } catch {
        return [] as BuildJob[];
      }
    }),
  );
  return allBuilds
    .flat()
    .sort((a, b) => (a.started_at < b.started_at ? 1 : a.started_at > b.started_at ? -1 : 0));
}

export async function createBuildJob(kbId: string, data: Partial<BuildJob>): Promise<BuildJob> {
  return fetchJSON<BuildJob>(`/api/knowledge-bases/${kbId}/builds`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Releases ---

export async function listReleases(kbId: string): Promise<PaginatedResponse<Release>> {
  return fetchJSON<PaginatedResponse<Release>>(`/api/knowledge-bases/${kbId}/releases`);
}

export async function getArtifacts(kbId: string): Promise<ArtifactsBundle> {
  return fetchJSON<ArtifactsBundle>(`/api/knowledge-bases/${kbId}/artifacts`);
}

// --- MCP Gateway ---

export async function mcpKBStatus(kbId: string): Promise<MCPKBStatus> {
  return fetchJSON<MCPKBStatus>("/mcp/kb_status", {
    method: "POST",
    body: JSON.stringify({ kb_id: kbId }),
  });
}

export async function mcpKBQuery(kbId: string, question: string): Promise<MCPQueryResult> {
  return fetchJSON<MCPQueryResult>("/mcp/kb_query", {
    method: "POST",
    body: JSON.stringify({ kb_id: kbId, question }),
  });
}

export async function mcpKBList(projectId?: string): Promise<KBListResponse> {
  return fetchJSON<KBListResponse>("/mcp/kb_list", {
    method: "POST",
    body: JSON.stringify({ project_id: projectId ?? null }),
  });
}

// --- Dashboard ---

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchJSON<DashboardStats>("/api/dashboard/stats");
}

// --- Mock fallback helpers for offline development ---

export function useMockSources(): Source[] {
  return MOCK_SOURCES;
}

export function useMockKnowledgeBases(): KnowledgeBase[] {
  return MOCK_KNOWLEDGE_BASES;
}

export function useMockBuildJobs(): BuildJob[] {
  return MOCK_BUILD_JOBS;
}

export function useMockReleases(): Release[] {
  return MOCK_RELEASES;
}

export function useMockArtifacts(): ArtifactVersion[] {
  return MOCK_ARTIFACTS;
}

export function useMockBindings(): KnowledgeBaseSourceBinding[] {
  return MOCK_BINDINGS;
}

export function useMockDashboardStats(): DashboardStats {
  return MOCK_DASHBOARD_STATS;
}

export function useMockMCPStatus(): MCPKBStatus {
  return MOCK_MCP_STATUS;
}

export function useMockMCPQueryResult(): MCPQueryResult {
  return MOCK_MCP_QUERY_RESULT;
}
