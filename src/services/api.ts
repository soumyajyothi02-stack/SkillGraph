import {
  Skill,
  SkillDetail,
  Technology,
  TechnologyDetail,
  JobRole,
  JobRoleDetail,
  Company,
  CompanyDetail,
  GraphData,
  ConnectionPath,
  HealthStatus,
} from '../types/graph';

export interface ApiResponse<T> {
  data: T;
  source: string;
  cypher?: {
    query: string;
    params: Record<string, any>;
  };
}

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health status.');
    return res.json();
  },

  async checkHealth(): Promise<HealthStatus> {
    return this.getHealth();
  },

  async getSkills(category?: string, search?: string): Promise<ApiResponse<Skill[]>> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/skills?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch skills.');
    return res.json();
  },

  async getSkillByName(name: string): Promise<ApiResponse<SkillDetail>> {
    const res = await fetch(`${API_BASE}/skills/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`Failed to fetch details for skill "${name}".`);
    return res.json();
  },

  async getTechnologies(type?: string, search?: string): Promise<ApiResponse<Technology[]>> {
    const params = new URLSearchParams();
    if (type && type !== 'All') params.append('type', type);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/technologies?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch technologies.');
    return res.json();
  },

  async getTechnologyByName(name: string): Promise<ApiResponse<TechnologyDetail>> {
    const res = await fetch(`${API_BASE}/technologies/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`Failed to fetch details for technology "${name}".`);
    return res.json();
  },

  async getJobRoles(experienceLevel?: string, search?: string): Promise<ApiResponse<JobRole[]>> {
    const params = new URLSearchParams();
    if (experienceLevel && experienceLevel !== 'All') params.append('experienceLevel', experienceLevel);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/roles?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch job roles.');
    return res.json();
  },

  async getJobRoleByTitle(title: string): Promise<ApiResponse<JobRoleDetail>> {
    const res = await fetch(`${API_BASE}/roles/${encodeURIComponent(title)}`);
    if (!res.ok) throw new Error(`Failed to fetch details for job role "${title}".`);
    return res.json();
  },

  async getCompanies(industry?: string, search?: string): Promise<ApiResponse<Company[]>> {
    const params = new URLSearchParams();
    if (industry && industry !== 'All') params.append('industry', industry);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/companies?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch companies.');
    return res.json();
  },

  async getCompanyByName(name: string): Promise<ApiResponse<CompanyDetail>> {
    const res = await fetch(`${API_BASE}/companies/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`Failed to fetch details for company "${name}".`);
    return res.json();
  },

  async getGraph(types?: string[], search?: string): Promise<GraphData> {
    const params = new URLSearchParams();
    if (types && types.length > 0) params.append('types', types.join(','));
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/graph?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch graph data.');
    return res.json();
  },

  async findConnections(start: string, target: string): Promise<{ paths: ConnectionPath[]; source: string; cypher?: any }> {
    const params = new URLSearchParams({ start, target });
    const res = await fetch(`${API_BASE}/connections?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to find connection paths.');
    return res.json();
  },

  async searchGlobal(q: string) {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Failed to perform search.');
    return res.json();
  },

  async seedDatabase(): Promise<{ success: boolean; message: string; stats: any }> {
    const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
    return res.json();
  },

  async runCustomQuery(query: string, params: Record<string, any> = {}) {
    const res = await fetch(`${API_BASE}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params }),
    });
    return res.json();
  },

  async runQuery(query: string, params: Record<string, any> = {}) {
    return this.runCustomQuery(query, params);
  },
};
