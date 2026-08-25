import React from 'react';
import {
  Zap,
  Cpu,
  Briefcase,
  Building2,
  Share2,
  ArrowRight,
  GitFork,
  Terminal,
  Database,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { TabType } from '../Sidebar';
import { HealthStatus } from '../../types/graph';
import { Badge } from '../Common/Badge';

interface DashboardViewProps {
  health: HealthStatus | null;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  health,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const stats = health?.stats || {
    skillsCount: 18,
    technologiesCount: 14,
    jobRolesCount: 11,
    companiesCount: 12,
    relationshipsCount: 65,
  };

  const overviewQuery = `MATCH (s:Skill)-[:REQUIRED_FOR]->(j:JobRole)-[:HIRED_BY]->(c:Company)
OPTIONAL MATCH (s)-[:USED_WITH]->(t:Technology)
RETURN s.name AS Skill, t.name AS Technology, j.title AS Role, c.name AS Company
LIMIT 20;`;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Editorial Header Block */}
      <div className="border-b border-[#2E2E2A] pb-8 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C87941]" />
              <span className="text-xs font-mono tracking-tight uppercase text-[#A7A39A]">
                Career & Skill Knowledge Graph · CognoDB Engine
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F2EFE7] tracking-tight leading-[1.15]">
              Explore the connective tissue of modern engineering careers.
            </h1>

            <p className="text-sm text-[#A7A39A] leading-relaxed max-w-2xl">
              SkillGraph models career trajectories, technology ecosystems, and organizational demand
              as a native directed property graph. Traverse multi-hop paths from fundamental skills to hiring companies with sub-millisecond query execution.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onNavigate('graph')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#C87941] hover:bg-[#B36834] text-[#F2EFE7] text-xs font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>

            <button
              onClick={() => onNavigate('connections')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#191917] hover:bg-[#22221F] text-[#F2EFE7] border border-[#2E2E2A] text-xs font-medium transition-colors"
            >
              <GitFork className="w-3.5 h-3.5 text-[#A7A39A]" />
              <span>Multi-Hop Traversal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Architectural Metric Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skills Metric */}
        <div
          onClick={() => onNavigate('skills')}
          className="bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] hover:border-[#C87941]/40 rounded-lg p-5 cursor-pointer transition-colors group relative overflow-hidden"
        >
          <div className="h-0.5 w-full bg-[#C87941] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7A39A]">
              <Zap className="w-3.5 h-3.5 text-[#C87941]" />
              <span>Skills</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#C87941] transition-colors" />
          </div>
          <div className="font-editorial text-3xl text-[#F2EFE7] mb-1">
            {stats.skillsCount}
          </div>
          <div className="text-xs text-[#6E6A62] line-clamp-1">
            Programming, AI/ML, Cloud, Systems
          </div>
        </div>

        {/* Technologies Metric */}
        <div
          onClick={() => onNavigate('technologies')}
          className="bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] hover:border-[#D8C7A5]/40 rounded-lg p-5 cursor-pointer transition-colors group relative overflow-hidden"
        >
          <div className="h-0.5 w-full bg-[#D8C7A5] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7A39A]">
              <Cpu className="w-3.5 h-3.5 text-[#D8C7A5]" />
              <span>Technologies</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#D8C7A5] transition-colors" />
          </div>
          <div className="font-editorial text-3xl text-[#F2EFE7] mb-1">
            {stats.technologiesCount}
          </div>
          <div className="text-xs text-[#6E6A62] line-clamp-1">
            PyTorch, React, Docker, Kubernetes
          </div>
        </div>

        {/* Job Roles Metric */}
        <div
          onClick={() => onNavigate('roles')}
          className="bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] hover:border-[#7A9A7B]/40 rounded-lg p-5 cursor-pointer transition-colors group relative overflow-hidden"
        >
          <div className="h-0.5 w-full bg-[#7A9A7B] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7A39A]">
              <Briefcase className="w-3.5 h-3.5 text-[#7A9A7B]" />
              <span>Job Roles</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#7A9A7B] transition-colors" />
          </div>
          <div className="font-editorial text-3xl text-[#F2EFE7] mb-1">
            {stats.jobRolesCount}
          </div>
          <div className="text-xs text-[#6E6A62] line-clamp-1">
            AI/ML Engineer, Full Stack, SRE
          </div>
        </div>

        {/* Companies Metric */}
        <div
          onClick={() => onNavigate('companies')}
          className="bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] hover:border-[#C0614E]/40 rounded-lg p-5 cursor-pointer transition-colors group relative overflow-hidden"
        >
          <div className="h-0.5 w-full bg-[#C0614E] absolute top-0 left-0" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7A39A]">
              <Building2 className="w-3.5 h-3.5 text-[#C0614E]" />
              <span>Companies</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#C0614E] transition-colors" />
          </div>
          <div className="font-editorial text-3xl text-[#F2EFE7] mb-1">
            {stats.companiesCount}
          </div>
          <div className="text-xs text-[#6E6A62] line-clamp-1">
            Google, OpenAI, Microsoft, Stripe
          </div>
        </div>
      </div>

      {/* Graph Schema & Ontology Chain */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E2E2A] pb-4">
          <div>
            <h2 className="font-editorial text-xl text-[#F2EFE7]">
              Graph Data Model & Relationship Semantics
            </h2>
            <p className="text-xs text-[#A7A39A] mt-1 font-mono">
              Directed labeled property graph ontology with index-free adjacency
            </p>
          </div>
          <button
            onClick={() =>
              onOpenCypherInspector(
                overviewQuery,
                {},
                'Complete Graph Overview Pattern',
                'In openCypher, graph patterns match visually: (Node)-[RELATIONSHIP]->(Node). No relational Cartesian joins or nested subqueries required.'
              )
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Inspect openCypher Pattern</span>
          </button>
        </div>

        {/* Visual Node Flow Chain */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Skill Node */}
          <div className="bg-[#11110F] border border-[#2E2E2A] rounded p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="skill">(:Skill)</Badge>
              <Zap className="w-3.5 h-3.5 text-[#C87941]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F2EFE7]">Python</div>
              <div className="text-xs text-[#A7A39A] mt-0.5">Category: AI & Data</div>
            </div>
            <div className="text-[10px] font-mono text-[#C87941] pt-2 border-t border-[#242420]">
              -[:USED_WITH]➔ / -[:REQUIRED_FOR]➔
            </div>
          </div>

          {/* Technology Node */}
          <div className="bg-[#11110F] border border-[#2E2E2A] rounded p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="tech">(:Technology)</Badge>
              <Cpu className="w-3.5 h-3.5 text-[#D8C7A5]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F2EFE7]">PyTorch</div>
              <div className="text-xs text-[#A7A39A] mt-0.5">Type: ML Framework</div>
            </div>
            <div className="text-[10px] font-mono text-[#D8C7A5] pt-2 border-t border-[#242420]">
              -[:USED_IN]➔
            </div>
          </div>

          {/* JobRole Node */}
          <div className="bg-[#11110F] border border-[#2E2E2A] rounded p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="role">(:JobRole)</Badge>
              <Briefcase className="w-3.5 h-3.5 text-[#7A9A7B]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F2EFE7]">AI/ML Engineer</div>
              <div className="text-xs text-[#A7A39A] mt-0.5">Salary: $160k - $240k</div>
            </div>
            <div className="text-[10px] font-mono text-[#7A9A7B] pt-2 border-t border-[#242420]">
              -[:HIRED_BY]➔
            </div>
          </div>

          {/* Company Node */}
          <div className="bg-[#11110F] border border-[#2E2E2A] rounded p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="company">(:Company)</Badge>
              <Building2 className="w-3.5 h-3.5 text-[#C0614E]" />
            </div>
            <div>
              <div className="text-sm font-medium text-[#F2EFE7]">Google</div>
              <div className="text-xs text-[#A7A39A] mt-0.5">Industry: AI & Search</div>
            </div>
            <div className="text-[10px] font-mono text-[#C0614E] pt-2 border-t border-[#242420]">
              (Destination Entity)
            </div>
          </div>
        </div>

        {/* Traversal Callout */}
        <div className="p-4 rounded bg-[#11110F] border border-[#2E2E2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GitFork className="w-4 h-4 text-[#C87941] shrink-0" />
            <div>
              <div className="text-xs font-medium text-[#F2EFE7]">
                Multi-Hop Path: Python ➔ PyTorch ➔ AI/ML Engineer ➔ Google
              </div>
              <div className="text-xs text-[#A7A39A] mt-0.5">
                Explore arbitrary depth relationship traversals with zero relational join penalty.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('connections')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors shrink-0"
          >
            <span>Launch Path Finder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comparative Evaluation: Graph Engine vs Relational SQL */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 space-y-6">
        <div>
          <h2 className="font-editorial text-xl text-[#F2EFE7]">
            Architectural Paradigm: Native Graph vs. Relational SQL
          </h2>
          <p className="text-xs text-[#A7A39A] mt-1 font-mono">
            Evaluating performance characteristics of connected domain models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-[#11110F] border border-[#2E2E2A] space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#C0614E] flex items-center justify-between">
              <span>Relational RDBMS (PostgreSQL / MySQL)</span>
              <span className="text-[10px] text-[#6E6A62]">O(N log M) Joins</span>
            </div>
            <ul className="text-xs text-[#A7A39A] space-y-2 list-disc list-inside leading-relaxed">
              <li>Requires 4-5 intermediate junction tables (<code className="text-[#F2EFE7]">skill_technologies</code>, <code className="text-[#F2EFE7]">role_skills</code>, <code className="text-[#F2EFE7]">company_roles</code>).</li>
              <li>Multi-hop queries require cascading <code className="text-[#C0614E]">JOIN</code> operations that degrade query planning performance as depth increases.</li>
              <li>Traversing bidirectional relationships requires complex recursive CTEs.</li>
              <li>Schema changes require table alterations and lock contention.</li>
            </ul>
          </div>

          <div className="p-4 rounded bg-[#11110F] border border-[#2E2E2A] space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#7A9A7B] flex items-center justify-between">
              <span>SkillGraph on CognoDB (openCypher)</span>
              <span className="text-[10px] text-[#7A9A7B]">O(1) Step Traversal</span>
            </div>
            <ul className="text-xs text-[#A7A39A] space-y-2 list-disc list-inside leading-relaxed">
              <li><strong className="text-[#F2EFE7]">Index-Free Adjacency:</strong> Each node directly stores memory pointers to its neighbors, traversing links in constant time per step.</li>
              <li><strong className="text-[#F2EFE7]">Pattern Matching:</strong> Multi-hop queries are expressed declaratively as <code className="text-[#7A9A7B]">MATCH (s)-[*1..4]-(c)</code>.</li>
              <li><strong className="text-[#F2EFE7]">Dynamic Ontologies:</strong> Add new relationship types (<code className="text-[#D8C7A5]">:PREREQUISITE_FOR</code>) without downtime.</li>
              <li><strong className="text-[#F2EFE7]">Semantic Richness:</strong> Relationships have properties, types, and directions as first-class citizens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
