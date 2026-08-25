import React, { useState, useEffect } from 'react';
import {
  Search,
  Briefcase,
  Zap,
  Cpu,
  Building2,
  Filter,
  Terminal,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { api } from '../../services/api';
import { JobRole, JobRoleDetail } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { CardSkeleton, DetailSkeleton } from '../Common/LoadingSkeleton';
import { EmptyState } from '../Common/EmptyState';
import { ErrorBanner } from '../Common/ErrorBanner';
import { TabType } from '../Sidebar';

interface RoleExplorerViewProps {
  initialRoleTitle?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const RoleExplorerView: React.FC<RoleExplorerViewProps> = ({
  initialRoleTitle,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(initialRoleTitle || null);
  const [selectedDetail, setSelectedDetail] = useState<JobRoleDetail | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);

  const experienceLevels = ['All', 'Entry-Level', 'Mid-Level', 'Senior', 'Lead'];

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getJobRoles(experienceFilter, searchQuery);
      setRoles(res.data);
      if (res.cypher) setActiveCypher(res.cypher);

      if (initialRoleTitle) {
        setSelectedTitle(initialRoleTitle);
      } else if (!selectedTitle && res.data.length > 0) {
        setSelectedTitle(res.data[0].title);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the SkillGraph database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [experienceFilter, searchQuery]);

  useEffect(() => {
    if (initialRoleTitle) {
      setSelectedTitle(initialRoleTitle);
    }
  }, [initialRoleTitle]);

  useEffect(() => {
    if (!selectedTitle) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await api.getJobRoleByTitle(selectedTitle);
        setSelectedDetail(res.data);
        if (res.cypher) setActiveCypher(res.cypher);
      } catch (err: any) {
        console.error('Failed to load role details:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedTitle]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#7A9A7B]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Career Architecture</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Job Roles & Positions
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Explore industry positions, evaluate required skill ontologies, stack prerequisites, and active hiring employers.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                `Job Role openCypher Query (${selectedTitle || 'List'})`,
                'Matches (j:JobRole) with incoming (:REQUIRED_FOR) skills, (:USED_IN) technologies, and outgoing (:HIRED_BY) companies in one unified graph traversal.'
              )
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Inspect openCypher Query</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={fetchRoles} />}

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#6E6A62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job roles (e.g. AI/ML Engineer, Backend Engineer, Data Scientist)..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#191917] border border-[#2E2E2A] rounded text-[#F2EFE7] placeholder:text-[#6E6A62] focus:outline-none focus:border-[#7A9A7B] transition-colors"
          />
        </div>

        {/* Experience Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <Filter className="w-3 h-3 text-[#6E6A62] shrink-0 mx-1" />
          {experienceLevels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setExperienceFilter(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                experienceFilter === lvl
                  ? 'bg-[#7A9A7B]/20 text-[#92B293] border border-[#7A9A7B]/40'
                  : 'bg-[#191917] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Master List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Role List */}
        <div className="lg:col-span-5 space-y-2">
          {loading ? (
            <CardSkeleton count={5} />
          ) : roles.length === 0 ? (
            <EmptyState
              title="No job roles found"
              description="Try adjusting your search criteria or experience level."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setExperienceFilter('All');
              }}
            />
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {roles.map((role) => {
                const isSelected = selectedTitle === role.title;
                return (
                  <div
                    key={role.title}
                    onClick={() => setSelectedTitle(role.title)}
                    className={`p-3.5 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#22221F] border-[#7A9A7B]/60'
                        : 'bg-[#191917] hover:bg-[#22221F]/70 border-[#2E2E2A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#F2EFE7]">{role.title}</span>
                        </div>
                        <p className="text-xs text-[#A7A39A] mt-1 line-clamp-2 leading-relaxed">
                          {role.description}
                        </p>
                      </div>
                      <Badge variant="role" size="sm">
                        {role.experienceLevel}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#2E2E2A] flex items-center justify-between text-[11px] font-mono text-[#A7A39A]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#C87941]">
                          <Zap className="w-3 h-3" />
                          {role.skillCount || 0} Skills
                        </span>
                        <span className="flex items-center gap-1 text-[#D8C7A5]">
                          <Cpu className="w-3 h-3" />
                          {role.technologyCount || 0} Tech
                        </span>
                        <span className="flex items-center gap-1 text-[#C0614E]">
                          <Building2 className="w-3 h-3" />
                          {role.companyCount || 0} Cos
                        </span>
                      </div>
                      <span className="text-[#92B293]">{role.salaryRange}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Selected Role Detail */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <DetailSkeleton />
          ) : !selectedDetail ? (
            <div className="bg-[#191917] border border-dashed border-[#2E2E2A] rounded p-12 text-center text-[#6E6A62] text-xs">
              Select a job role from the list on the left to view required skills and tech stack.
            </div>
          ) : (
            <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 space-y-6 sticky top-20">
              {/* Detail Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#2E2E2A]">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="role">Job Role</Badge>
                    <Badge variant="neutral">{selectedDetail.experienceLevel}</Badge>
                  </div>
                  <h2 className="font-editorial text-2xl text-[#F2EFE7] mt-1.5">{selectedDetail.title}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs font-mono text-[#7A9A7B]">
                    <DollarSign className="w-3.5 h-3.5 text-[#7A9A7B]" />
                    <span>Compensation Range: {selectedDetail.salaryRange}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('graph', selectedDetail.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors"
                >
                  <span>Focus in Graph</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-[#A7A39A] leading-relaxed">
                {selectedDetail.description}
              </p>

              {/* Section 1: Required Skills ((s)-[:REQUIRED_FOR]->(j)) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C87941] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Required Skills ({selectedDetail.requiredSkills?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (s:Skill)-[:REQUIRED_FOR]➔(j)
                  </span>
                </div>
                {selectedDetail.requiredSkills?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No skills registered.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDetail.requiredSkills?.map((skill) => (
                      <div
                        key={skill.name}
                        onClick={() => onNavigate('skills', skill.name)}
                        className="p-3 bg-[#11110F] border border-[#2E2E2A] hover:border-[#C87941]/40 rounded cursor-pointer transition-colors group flex items-start justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#C87941]">
                            {skill.name}
                          </div>
                          <div className="text-[10px] text-[#A7A39A] font-mono mt-0.5">{skill.category}</div>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {skill.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Technologies Used ((t)-[:USED_IN]->(j)) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D8C7A5] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Technologies Used ({selectedDetail.technologies?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (t:Technology)-[:USED_IN]➔(j)
                  </span>
                </div>
                {selectedDetail.technologies?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No technologies mapped.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDetail.technologies?.map((tech) => (
                      <div
                        key={tech.name}
                        onClick={() => onNavigate('technologies', tech.name)}
                        className="p-3 bg-[#11110F] border border-[#2E2E2A] hover:border-[#D8C7A5]/40 rounded cursor-pointer transition-colors group"
                      >
                        <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#D8C7A5]">
                          {tech.name}
                        </div>
                        <div className="text-[10px] text-[#A7A39A] font-mono mt-0.5">{tech.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Companies Hiring ((j)-[:HIRED_BY]->(c)) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C0614E] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hiring Companies ({selectedDetail.companies?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (j)-[:HIRED_BY]➔(c:Company)
                  </span>
                </div>
                {selectedDetail.companies?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No companies hiring this role.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.companies?.map((comp) => (
                      <div
                        key={comp.name}
                        onClick={() => onNavigate('companies', comp.name)}
                        className="px-3.5 py-1.5 bg-[#11110F] border border-[#2E2E2A] hover:border-[#C0614E]/40 rounded cursor-pointer transition-colors group flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#C0614E]" />
                        <div>
                          <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#C0614E]">
                            {comp.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#A7A39A]">{comp.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Related Career Paths (Graph Skill Overlap) */}
              {selectedDetail.relatedJobRoles && selectedDetail.relatedJobRoles.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[#2E2E2A]">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#A7A39A] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Related Career Paths (Shared Skill Graph Overlap)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.relatedJobRoles.map((role) => (
                      <button
                        key={role.title}
                        onClick={() => setSelectedTitle(role.title)}
                        className="px-3 py-1.5 rounded text-xs font-mono bg-[#11110F] hover:bg-[#22221F] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A] transition-colors flex items-center gap-1.5"
                      >
                        <span>{role.title}</span>
                        <span className="text-[10px] text-[#6E6A62]">({role.experienceLevel})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
