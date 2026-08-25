export type NodeType = 'Skill' | 'Technology' | 'JobRole' | 'Company';

export interface Skill {
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  technologyCount?: number;
  jobRoleCount?: number;
  relatedSkillCount?: number;
}

export interface Technology {
  name: string;
  type: string;
  description: string;
  skillCount?: number;
  jobRoleCount?: number;
  companyCount?: number;
}

export interface JobRole {
  title: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Principal';
  salaryRange: string;
  description: string;
  skillCount?: number;
  technologyCount?: number;
  companyCount?: number;
}

export interface Company {
  name: string;
  industry: string;
  location: string;
  website: string;
  roleCount?: number;
}

export interface SkillDetail extends Skill {
  technologies: Technology[];
  jobRoles: JobRole[];
  relatedSkills: Skill[];
  companies: Company[];
}

export interface TechnologyDetail extends Technology {
  relatedSkills: Skill[];
  relatedJobRoles: JobRole[];
  connectedCompanies: Company[];
}

export interface JobRoleDetail extends JobRole {
  requiredSkills: Skill[];
  technologies: Technology[];
  companies: Company[];
  relatedJobRoles: { title: string; experienceLevel: string }[];
}

export interface CompanyDetail extends Company {
  jobRoles: JobRole[];
  connectedSkills: Skill[];
  connectedTechnologies: Technology[];
}

export interface GraphNode {
  id: string;
  label: NodeType;
  name?: string;
  title?: string;
  category?: string;
  difficulty?: string;
  type?: string;
  experienceLevel?: string;
  salaryRange?: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  id?: string | number;
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  source?: string;
  cypher?: {
    query: string;
    params: Record<string, any>;
  };
}

export interface ConnectionPath {
  pathId: string;
  hopCount: number;
  nodes: GraphNode[];
  relationships: {
    type: string;
    source: string;
    target: string;
  }[];
  formattedPath: string;
}

export interface HealthStatus {
  status?: string;
  appName?: string;
  connected: boolean;
  message?: string;
  driver?: string;
  database?: string;
  error?: string;
  mode?: string;
  timestamp?: string;
  stats?: {
    skillsCount: number;
    technologiesCount: number;
    jobRolesCount: number;
    companiesCount: number;
    relationshipsCount: number;
  };
}
