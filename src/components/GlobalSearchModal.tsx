import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Zap, Cpu, Briefcase, Building2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { TabType } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType, entityName?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    skills: any[];
    technologies: any[];
    jobRoles: any[];
    companies: any[];
    totalCount: number;
  }>({
    skills: [],
    technologies: [],
    jobRoles: [],
    companies: [],
    totalCount: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ skills: [], technologies: [], jobRoles: [], companies: [], totalCount: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ skills: [], technologies: [], jobRoles: [], companies: [], totalCount: 0 });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-[#11110F]/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative px-4 py-3 border-b border-[#2E2E2A] flex items-center gap-3 bg-[#11110F]">
          <Search className="w-4 h-4 text-[#C87941] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, technologies, job roles, or companies..."
            className="w-full bg-transparent text-xs text-[#F2EFE7] placeholder:text-[#6E6A62] focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#6E6A62] hover:text-[#F2EFE7]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#A7A39A] bg-[#191917] rounded border border-[#2E2E2A]">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="p-6 text-center text-xs font-mono text-[#A7A39A] animate-pulse">
              Querying CognoDB graph indexes...
            </div>
          )}

          {!loading && !query && (
            <div className="p-8 text-center text-[#6E6A62] text-xs">
              <p>Type to search across the entire ontology graph</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                {['Python', 'Machine Learning', 'AI/ML Engineer', 'Google', 'PyTorch', 'AWS'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded bg-[#11110F] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A] font-mono text-xs transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query && results.totalCount === 0 && (
            <div className="p-8 text-center text-[#A7A39A] text-xs font-mono">
              No matching nodes found in the graph for "{query}".
            </div>
          )}

          {/* Skills Results */}
          {results.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-mono uppercase tracking-wider text-[#C87941]">
                <Zap className="w-3 h-3" />
                <span>Skills ({results.skills.length})</span>
              </div>
              <div className="space-y-1">
                {results.skills.map((s) => (
                  <div
                    key={s.name}
                    onClick={() => {
                      onNavigate('skills', s.name);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded hover:bg-[#22221F] cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#C87941]">
                        {s.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#A7A39A]">{s.category} · {s.difficulty}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#C87941] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technologies Results */}
          {results.technologies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-mono uppercase tracking-wider text-[#D8C7A5]">
                <Cpu className="w-3 h-3" />
                <span>Technologies ({results.technologies.length})</span>
              </div>
              <div className="space-y-1">
                {results.technologies.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => {
                      onNavigate('technologies', t.name);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded hover:bg-[#22221F] cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#D8C7A5]">
                        {t.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#A7A39A]">{t.type}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#D8C7A5] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Roles Results */}
          {results.jobRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-mono uppercase tracking-wider text-[#7A9A7B]">
                <Briefcase className="w-3 h-3" />
                <span>Job Roles ({results.jobRoles.length})</span>
              </div>
              <div className="space-y-1">
                {results.jobRoles.map((j) => (
                  <div
                    key={j.title}
                    onClick={() => {
                      onNavigate('roles', j.title);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded hover:bg-[#22221F] cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#7A9A7B]">
                        {j.title}
                      </div>
                      <div className="text-[11px] font-mono text-[#A7A39A]">{j.experienceLevel} · {j.salaryRange}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#7A9A7B] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Companies Results */}
          {results.companies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-mono uppercase tracking-wider text-[#C0614E]">
                <Building2 className="w-3 h-3" />
                <span>Companies ({results.companies.length})</span>
              </div>
              <div className="space-y-1">
                {results.companies.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => {
                      onNavigate('companies', c.name);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded hover:bg-[#22221F] cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#F2EFE7] group-hover:text-[#C0614E]">
                        {c.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#A7A39A]">{c.industry} · {c.location}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#C0614E] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
