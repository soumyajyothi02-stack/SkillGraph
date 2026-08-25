import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Briefcase,
  Zap,
  Cpu,
  MapPin,
  Globe,
  Filter,
  Terminal,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Company, CompanyDetail } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { CardSkeleton, DetailSkeleton } from '../Common/LoadingSkeleton';
import { EmptyState } from '../Common/EmptyState';
import { ErrorBanner } from '../Common/ErrorBanner';
import { TabType } from '../Sidebar';

interface CompanyExplorerViewProps {
  initialCompanyName?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const CompanyExplorerView: React.FC<CompanyExplorerViewProps> = ({
  initialCompanyName,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(
    initialCompanyName || null
  );
  const [selectedDetail, setSelectedDetail] = useState<CompanyDetail | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);

  const industries = [
    'All',
    'Technology & AI',
    'Enterprise & Cloud',
    'Cloud Infrastructure & E-Commerce',
    'Social Media & AI Research',
    'Artificial Intelligence',
    'Financial Technology',
    'Data & AI Lakehouse',
    'Streaming & Media Services',
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCompanies(industryFilter, searchQuery);
      setCompanies(res.data);
      if (res.cypher) setActiveCypher(res.cypher);

      if (initialCompanyName) {
        setSelectedCompanyName(initialCompanyName);
      } else if (!selectedCompanyName && res.data.length > 0) {
        setSelectedCompanyName(res.data[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the SkillGraph database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [industryFilter, searchQuery]);

  useEffect(() => {
    if (initialCompanyName) {
      setSelectedCompanyName(initialCompanyName);
    }
  }, [initialCompanyName]);

  useEffect(() => {
    if (!selectedCompanyName) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await api.getCompanyByName(selectedCompanyName);
        setSelectedDetail(res.data);
        if (res.cypher) setActiveCypher(res.cypher);
      } catch (err: any) {
        console.error('Failed to load company details:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedCompanyName]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C0614E]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Organizational Graph</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Companies & Employers
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Analyze hiring companies, tech stack dependencies, and in-demand skills mapped through open positions.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                `Company openCypher Query (${selectedCompanyName || 'List'})`,
                'Traverses from (c:Company) through incoming (:HIRED_BY) job roles, and up to 2 hops into connected (:USED_IN) technologies and (:REQUIRED_FOR) skills.'
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
      {error && <ErrorBanner message={error} onRetry={fetchCompanies} />}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#6E6A62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies (e.g. Google, Microsoft, OpenAI, Stripe)..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#191917] border border-[#2E2E2A] rounded text-[#F2EFE7] placeholder:text-[#6E6A62] focus:outline-none focus:border-[#C0614E] transition-colors"
          />
        </div>

        {/* Industry Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <Filter className="w-3 h-3 text-[#6E6A62] shrink-0 mx-1" />
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustryFilter(ind)}
              className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                industryFilter === ind
                  ? 'bg-[#C0614E]/20 text-[#D47562] border border-[#C0614E]/40'
                  : 'bg-[#191917] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A]'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Master List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Companies List */}
        <div className="lg:col-span-5 space-y-2">
          {loading ? (
            <CardSkeleton count={5} />
          ) : companies.length === 0 ? (
            <EmptyState
              title="No companies found"
              description="Try adjusting your search criteria or industry filter."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setIndustryFilter('All');
              }}
            />
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {companies.map((comp) => {
                const isSelected = selectedCompanyName === comp.name;
                return (
                  <div
                    key={comp.name}
                    onClick={() => setSelectedCompanyName(comp.name)}
                    className={`p-3.5 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#22221F] border-[#C0614E]/60'
                        : 'bg-[#191917] hover:bg-[#22221F]/70 border-[#2E2E2A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#F2EFE7]">{comp.name}</span>
                          <Badge variant="company" size="sm">
                            {comp.industry}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono text-[#A7A39A] mt-1">
                          <MapPin className="w-3 h-3 text-[#6E6A62]" />
                          <span>{comp.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#2E2E2A] flex items-center justify-between text-[11px] font-mono text-[#A7A39A]">
                      <span className="flex items-center gap-1 text-[#7A9A7B]">
                        <Briefcase className="w-3 h-3" />
                        {comp.roleCount || 0} Open Roles
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-[#C0614E] translate-x-0.5' : 'text-[#6E6A62]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Selected Company Detail */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <DetailSkeleton />
          ) : !selectedDetail ? (
            <div className="bg-[#191917] border border-dashed border-[#2E2E2A] rounded p-12 text-center text-[#6E6A62] text-xs">
              Select a company from the list on the left to inspect hiring roles and required tech stacks.
            </div>
          ) : (
            <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 space-y-6 sticky top-20">
              {/* Detail Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#2E2E2A]">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="company">Company</Badge>
                    <span className="text-xs font-mono text-[#A7A39A] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#6E6A62]" />
                      {selectedDetail.location}
                    </span>
                  </div>
                  <h2 className="font-editorial text-2xl text-[#F2EFE7] mt-1.5">{selectedDetail.name}</h2>
                  <p className="text-xs font-mono text-[#C0614E]">{selectedDetail.industry}</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDetail.website && (
                    <a
                      href={selectedDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors"
                    >
                      <Globe className="w-3 h-3 text-[#6E6A62]" />
                      <span>Website</span>
                    </a>
                  )}
                  <button
                    onClick={() => onNavigate('graph', selectedDetail.name)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors"
                  >
                    <span>Focus in Graph</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Section 1: Job Roles Hired ((j)-[:HIRED_BY]->(c)) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7A9A7B] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Positions at {selectedDetail.name} ({selectedDetail.jobRoles?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (j:JobRole)-[:HIRED_BY]➔(c)
                  </span>
                </div>
                {selectedDetail.jobRoles?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No roles mapped in graph.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDetail.jobRoles?.map((role) => (
                      <div
                        key={role.title}
                        onClick={() => onNavigate('roles', role.title)}
                        className="p-3 bg-[#11110F] border border-[#2E2E2A] hover:border-[#7A9A7B]/40 rounded cursor-pointer transition-colors group"
                      >
                        <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#7A9A7B]">
                          {role.title}
                        </div>
                        <div className="text-[10px] text-[#A7A39A] font-mono mt-0.5">{role.experienceLevel} · {role.salaryRange}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Technologies Used By Roles (2-Hop Traversal) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D8C7A5] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Technologies in Stack ({selectedDetail.connectedTechnologies?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (t)-[:USED_IN]➔(j)-[:HIRED_BY]➔(c)
                  </span>
                </div>
                {selectedDetail.connectedTechnologies?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No technologies directly connected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.connectedTechnologies?.map((tech) => (
                      <div
                        key={tech.name}
                        onClick={() => onNavigate('technologies', tech.name)}
                        className="px-3 py-1.5 bg-[#11110F] border border-[#2E2E2A] hover:border-[#D8C7A5]/40 rounded cursor-pointer transition-colors group flex items-center gap-2"
                      >
                        <Cpu className="w-3.5 h-3.5 text-[#D8C7A5]" />
                        <div>
                          <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#D8C7A5]">
                            {tech.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#A7A39A]">{tech.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Skills Connected to Roles (2-Hop Traversal) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C87941] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>In-Demand Candidate Skills ({selectedDetail.connectedSkills?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (s)-[:REQUIRED_FOR]➔(j)-[:HIRED_BY]➔(c)
                  </span>
                </div>
                {selectedDetail.connectedSkills?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No connected skills found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.connectedSkills?.map((skill) => (
                      <button
                        key={skill.name}
                        onClick={() => onNavigate('skills', skill.name)}
                        className="px-2.5 py-1 bg-[#11110F] border border-[#2E2E2A] hover:border-[#C87941]/40 rounded text-xs font-mono text-[#A7A39A] hover:text-[#F2EFE7] transition-colors flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3 text-[#C87941]" />
                        <span>{skill.name}</span>
                        <span className="text-[10px] text-[#6E6A62]">({skill.category})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
