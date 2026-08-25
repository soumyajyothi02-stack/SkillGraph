import React, { useState, useEffect } from 'react';
import {
  Search,
  Cpu,
  Zap,
  Briefcase,
  Building2,
  Filter,
  Terminal,
  ExternalLink,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { api } from '../../services/api';
import { Technology, TechnologyDetail } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { CardSkeleton, DetailSkeleton } from '../Common/LoadingSkeleton';
import { EmptyState } from '../Common/EmptyState';
import { ErrorBanner } from '../Common/ErrorBanner';
import { TabType } from '../Sidebar';

interface TechnologyExplorerViewProps {
  initialTechnologyName?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const TechnologyExplorerView: React.FC<TechnologyExplorerViewProps> = ({
  initialTechnologyName,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTechName, setSelectedTechName] = useState<string | null>(initialTechnologyName || null);
  const [selectedDetail, setSelectedDetail] = useState<TechnologyDetail | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);

  const techTypes = [
    'All',
    'Programming Language',
    'Machine Learning Framework',
    'Relational Database',
    'Containerization Tool',
    'Cloud Platform',
    'Frontend Library',
    'Backend Runtime',
    'Graph Database',
  ];

  // Fetch list of technologies
  const fetchTechnologies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTechnologies(typeFilter, searchQuery);
      setTechnologies(res.data);
      if (res.cypher) setActiveCypher(res.cypher);

      if (initialTechnologyName) {
        setSelectedTechName(initialTechnologyName);
      } else if (!selectedTechName && res.data.length > 0) {
        setSelectedTechName(res.data[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the SkillGraph database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, [typeFilter, searchQuery]);

  useEffect(() => {
    if (initialTechnologyName) {
      setSelectedTechName(initialTechnologyName);
    }
  }, [initialTechnologyName]);

  // Fetch detail for selected technology
  useEffect(() => {
    if (!selectedTechName) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await api.getTechnologyByName(selectedTechName);
        setSelectedDetail(res.data);
        if (res.cypher) setActiveCypher(res.cypher);
      } catch (err: any) {
        console.error('Failed to load technology details:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTechName]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C87941]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Stack Architecture</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Technologies & Frameworks
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Query production runtimes, frameworks, and databases mapped to engineering skills and hiring companies.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                'Technology Node Cypher Query',
                'Inspect the parameterized openCypher query executed against CognoDB to construct this technology view.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#2E2E2A] bg-[#191917] hover:bg-[#22221F] text-xs font-mono text-[#D8C7A5] transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Cypher: MATCH (t:Technology)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technologies by name or description..."
            className="w-full bg-[#191917] border border-[#2E2E2A] rounded pl-9 pr-4 py-2 text-xs text-[#F2EFE7] placeholder-[#6E6A62] focus:outline-none focus:border-[#C87941] transition-colors font-mono"
          />
        </div>

        <div className="sm:col-span-4 relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-[#191917] border border-[#2E2E2A] rounded pl-9 pr-8 py-2 text-xs text-[#F2EFE7] focus:outline-none focus:border-[#C87941] transition-colors appearance-none font-mono cursor-pointer"
          >
            {techTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Tech Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Interface */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={fetchTechnologies}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Technology List */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6A62]">
              Technologies ({technologies.length})
            </span>
          </div>

          {loading ? (
            <div className="space-y-2">
              <CardSkeleton count={5} />
            </div>
          ) : technologies.length === 0 ? (
            <EmptyState
              title="No Technologies Found"
              description="No technologies match your search query. Try broadening your filter."
              actionText="Reset Filters"
              onAction={() => {
                setTypeFilter('All');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {technologies.map((tech) => {
                const isSelected = selectedTechName?.toLowerCase() === tech.name.toLowerCase();
                return (
                  <button
                    key={tech.name}
                    id={`tech-item-${tech.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedTechName(tech.name)}
                    className={`w-full text-left p-3.5 rounded border transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#22221F] border-[#C87941] shadow-sm'
                        : 'bg-[#191917] border-[#2E2E2A] hover:bg-[#1C1C19] hover:border-[#3E3E38]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-editorial text-base text-[#F2EFE7]">
                            {tech.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#11110F] border border-[#2E2E2A] text-[#A7A39A]">
                            {tech.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#A7A39A] line-clamp-2 leading-relaxed">
                          {tech.description}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[#C87941] translate-x-0.5' : 'text-[#6E6A62]'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#2E2E2A]/60 text-[11px] font-mono text-[#6E6A62]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#C87941]" />
                        <span>{tech.skillCount || 0} skills</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#D8C7A5]" />
                        <span>{tech.jobRoleCount || 0} roles</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#A7A39A]" />
                        <span>{tech.companyCount || 0} companies</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Technology Detail View */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <DetailSkeleton />
          ) : selectedDetail ? (
            <div className="bg-[#191917] border border-[#2E2E2A] rounded p-6 space-y-6">
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#2E2E2A]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="tech">{selectedDetail.type}</Badge>
                  </div>
                  <h2 className="font-editorial text-2xl text-[#F2EFE7]">
                    {selectedDetail.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('graph', selectedDetail.name)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#22221F] border border-[#2E2E2A] hover:border-[#C87941] text-xs font-mono text-[#D8C7A5] transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-[#C87941]" />
                    <span>View in Graph</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-[#A7A39A] tracking-wider">
                  Technology Specification
                </h3>
                <p className="text-xs text-[#F2EFE7] leading-relaxed bg-[#11110F] p-4 rounded border border-[#2E2E2A]">
                  {selectedDetail.description}
                </p>
              </div>

              {/* Relationship Section: Used in Job Roles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase text-[#A7A39A] tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#C87941]" />
                    <span>Used in Job Roles (:USED_IN)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#6E6A62]">
                    {selectedDetail.relatedJobRoles?.length || 0} mapped roles
                  </span>
                </div>

                {selectedDetail.relatedJobRoles && selectedDetail.relatedJobRoles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDetail.relatedJobRoles.map((role) => (
                      <button
                        key={role.title}
                        onClick={() => onNavigate('roles', role.title)}
                        className="text-left p-3 rounded bg-[#11110F] border border-[#2E2E2A] hover:border-[#C87941] transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-editorial text-sm text-[#F2EFE7] group-hover:text-[#C87941] transition-colors">
                            {role.title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#6E6A62] group-hover:text-[#C87941] transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[#A7A39A]">
                          <span>{role.experienceLevel}</span>
                          <span>·</span>
                          <span className="text-[#6E6A62]">{role.salaryRange}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6E6A62] font-mono p-3 bg-[#11110F] rounded border border-[#2E2E2A]">
                    No direct job roles mapped in CognoDB.
                  </p>
                )}
              </div>

              {/* Relationship Section: Associated Skills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase text-[#A7A39A] tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#C87941]" />
                    <span>Associated Engineering Skills (&lt;-[:USED_WITH])</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#6E6A62]">
                    {selectedDetail.relatedSkills?.length || 0} skills
                  </span>
                </div>

                {selectedDetail.relatedSkills && selectedDetail.relatedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.relatedSkills.map((skill) => (
                      <button
                        key={skill.name}
                        onClick={() => onNavigate('skills', skill.name)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#11110F] border border-[#2E2E2A] hover:border-[#C87941] text-xs text-[#F2EFE7] hover:text-[#C87941] transition-colors group"
                      >
                        <span>{skill.name}</span>
                        <span className="text-[10px] font-mono text-[#6E6A62] group-hover:text-[#D8C7A5]">
                          ({skill.difficulty})
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6E6A62] font-mono p-3 bg-[#11110F] rounded border border-[#2E2E2A]">
                    No associated skills mapped in CognoDB.
                  </p>
                )}
              </div>

              {/* Multi-Hop Relationship: Connected Hiring Companies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase text-[#A7A39A] tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#C87941]" />
                    <span>Hiring Companies (2-Hop: Tech ➔ Role ➔ Company)</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#6E6A62]">
                    {selectedDetail.connectedCompanies?.length || 0} organizations
                  </span>
                </div>

                {selectedDetail.connectedCompanies && selectedDetail.connectedCompanies.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDetail.connectedCompanies.map((comp) => (
                      <button
                        key={comp.name}
                        onClick={() => onNavigate('companies', comp.name)}
                        className="text-left p-3 rounded bg-[#11110F] border border-[#2E2E2A] hover:border-[#C87941] transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-editorial text-sm text-[#F2EFE7] group-hover:text-[#C87941] transition-colors">
                            {comp.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#6E6A62] group-hover:text-[#C87941] transition-colors" />
                        </div>
                        <div className="text-[11px] font-mono text-[#A7A39A] mt-1 truncate">
                          {comp.industry} · {comp.location}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6E6A62] font-mono p-3 bg-[#11110F] rounded border border-[#2E2E2A]">
                    No hiring organizations currently mapped for this technology.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#191917] border border-[#2E2E2A] rounded p-12 text-center text-xs font-mono text-[#6E6A62]">
              Select a technology from the left panel to inspect its ontology graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
