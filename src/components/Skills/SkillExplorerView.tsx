import React, { useState, useEffect } from 'react';
import {
  Search,
  Zap,
  Cpu,
  Briefcase,
  Building2,
  Filter,
  Terminal,
  ExternalLink,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { api } from '../../services/api';
import { Skill, SkillDetail } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { CardSkeleton, DetailSkeleton } from '../Common/LoadingSkeleton';
import { EmptyState } from '../Common/EmptyState';
import { ErrorBanner } from '../Common/ErrorBanner';
import { TabType } from '../Sidebar';

interface SkillExplorerViewProps {
  initialSkillName?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const SkillExplorerView: React.FC<SkillExplorerViewProps> = ({
  initialSkillName,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(initialSkillName || null);
  const [selectedDetail, setSelectedDetail] = useState<SkillDetail | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);

  const categories = [
    'All',
    'Programming',
    'AI & Data',
    'Web Development',
    'Software Engineering',
    'DevOps & Cloud',
    'Data Engineering',
    'Security',
    'Design & Frontend',
  ];

  // Fetch list of skills
  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getSkills(categoryFilter, searchQuery);
      setSkills(res.data);
      if (res.cypher) setActiveCypher(res.cypher);

      if (initialSkillName) {
        setSelectedSkillName(initialSkillName);
      } else if (!selectedSkillName && res.data.length > 0) {
        setSelectedSkillName(res.data[0].name);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the SkillGraph database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    if (initialSkillName) {
      setSelectedSkillName(initialSkillName);
    }
  }, [initialSkillName]);

  // Fetch detail for selected skill
  useEffect(() => {
    if (!selectedSkillName) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await api.getSkillByName(selectedSkillName);
        setSelectedDetail(res.data);
        if (res.cypher) setActiveCypher(res.cypher);
      } catch (err: any) {
        console.error('Failed to load skill details:', err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedSkillName]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C87941]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Ontology Explorer</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Skills & Competencies
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Query foundational engineering skills and evaluate their relationship chains to technologies, roles, and hiring organizations.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                `Skill openCypher Query (${selectedSkillName || 'List'})`,
                'Traverses from (s:Skill) through (:USED_WITH), (:REQUIRED_FOR), and (:RELATED_TO) relationships in a single graph matching operation.'
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
      {error && <ErrorBanner message={error} onRetry={fetchSkills} />}

      {/* Search and Category Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#6E6A62] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills (e.g. Python, Machine Learning, SQL)..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-[#191917] border border-[#2E2E2A] rounded text-[#F2EFE7] placeholder:text-[#6E6A62] focus:outline-none focus:border-[#C87941] transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <Filter className="w-3 h-3 text-[#6E6A62] shrink-0 mx-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#C87941]/20 text-[#E08C50] border border-[#C87941]/40'
                  : 'bg-[#191917] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Master List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skills List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2">
          {loading ? (
            <CardSkeleton count={5} />
          ) : skills.length === 0 ? (
            <EmptyState
              title="No skills found"
              description="Try changing your search query or selecting 'All' categories."
              actionText="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setCategoryFilter('All');
              }}
            />
          ) : (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {skills.map((skill) => {
                const isSelected = selectedSkillName === skill.name;
                return (
                  <div
                    key={skill.name}
                    onClick={() => setSelectedSkillName(skill.name)}
                    className={`p-3.5 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#22221F] border-[#C87941]/60'
                        : 'bg-[#191917] hover:bg-[#22221F]/70 border-[#2E2E2A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#F2EFE7]">{skill.name}</span>
                          <Badge variant="skill" size="sm">
                            {skill.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#A7A39A] mt-1 line-clamp-2 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          skill.difficulty === 'Beginner'
                            ? 'beginner'
                            : skill.difficulty === 'Intermediate'
                            ? 'intermediate'
                            : skill.difficulty === 'Advanced'
                            ? 'advanced'
                            : 'expert'
                        }
                        size="sm"
                      >
                        {skill.difficulty}
                      </Badge>
                    </div>

                    {/* Edge counts */}
                    <div className="pt-2 border-t border-[#2E2E2A] flex items-center justify-between text-[11px] font-mono text-[#A7A39A]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[#D8C7A5]">
                          <Cpu className="w-3 h-3" />
                          {skill.technologyCount || 0} Tech
                        </span>
                        <span className="flex items-center gap-1 text-[#7A9A7B]">
                          <Briefcase className="w-3 h-3" />
                          {skill.jobRoleCount || 0} Roles
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isSelected ? 'text-[#C87941] translate-x-0.5' : 'text-[#6E6A62]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Skill Detail Inspector (7 Cols) */}
        <div className="lg:col-span-7">
          {detailLoading ? (
            <DetailSkeleton />
          ) : !selectedDetail ? (
            <div className="bg-[#191917] border border-dashed border-[#2E2E2A] rounded p-12 text-center text-[#6E6A62] text-xs">
              Select a skill from the list on the left to view its connected graph entities.
            </div>
          ) : (
            <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 space-y-6 sticky top-20">
              {/* Detail Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#2E2E2A]">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="skill">Skill</Badge>
                    <Badge
                      variant={
                        selectedDetail.difficulty === 'Beginner'
                          ? 'beginner'
                          : selectedDetail.difficulty === 'Intermediate'
                          ? 'intermediate'
                          : selectedDetail.difficulty === 'Advanced'
                          ? 'advanced'
                          : 'expert'
                      }
                    >
                      {selectedDetail.difficulty}
                    </Badge>
                  </div>
                  <h2 className="font-editorial text-2xl text-[#F2EFE7] mt-1.5">{selectedDetail.name}</h2>
                  <p className="text-xs font-mono text-[#C87941]">{selectedDetail.category}</p>
                </div>

                <button
                  onClick={() => onNavigate('graph', selectedDetail.name)}
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

              {/* Section 1: Related Technologies (-[:USED_WITH]->) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#D8C7A5] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Used With Technologies ({selectedDetail.technologies?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">-[:USED_WITH]➔</span>
                </div>
                {selectedDetail.technologies?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No direct technology mappings found.</p>
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

              {/* Section 2: Job Roles Requiring This Skill (-[:REQUIRED_FOR]->) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#7A9A7B] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Job Roles Requiring Skill ({selectedDetail.jobRoles?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">-[:REQUIRED_FOR]➔</span>
                </div>
                {selectedDetail.jobRoles?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No job roles mapped to this skill.</p>
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

              {/* Section 3: Companies Hiring for Connected Roles (2-Hop Traversal) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#C0614E] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Hiring Companies (2-Hop Traversal) ({selectedDetail.companies?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-[#6E6A62] font-mono">
                    (s)-[:REQUIRED_FOR]-&gt;(j)-[:HIRED_BY]-&gt;(c)
                  </span>
                </div>
                {selectedDetail.companies?.length === 0 ? (
                  <p className="text-xs text-[#6E6A62] italic">No companies currently connected.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.companies?.map((comp) => (
                      <div
                        key={comp.name}
                        onClick={() => onNavigate('companies', comp.name)}
                        className="px-3 py-1.5 bg-[#11110F] border border-[#2E2E2A] hover:border-[#C0614E]/40 rounded cursor-pointer transition-colors group flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#C0614E]" />
                        <div>
                          <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#C0614E]">
                            {comp.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#A7A39A]">{comp.industry}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 4: Related Skills (-[:RELATED_TO]-) */}
              {selectedDetail.relatedSkills && selectedDetail.relatedSkills.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-[#2E2E2A]">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#A7A39A] flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Related Skills in Graph</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetail.relatedSkills.map((rel) => (
                      <button
                        key={rel.name}
                        onClick={() => setSelectedSkillName(rel.name)}
                        className="px-2 py-1 rounded text-xs font-mono bg-[#11110F] hover:bg-[#22221F] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A] transition-colors"
                      >
                        {rel.name}
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
