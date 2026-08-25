import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Sparkles,
  Code2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { Badge } from '../Common/Badge';

export const CypherPlaygroundView: React.FC = () => {
  const templates = [
    {
      id: 'multihop',
      title: '1. Multi-Hop Traversal (Python ➔ Roles ➔ Companies)',
      query: `MATCH path = (s:Skill {name: 'Python'})-[:REQUIRED_FOR]->(j:JobRole)-[:HIRED_BY]->(c:Company)
RETURN s.name AS Skill, j.title AS Role, j.salaryRange AS Salary, c.name AS Company
ORDER BY j.title;`,
      explanation:
        'Traverses 2 hops from a Skill through intermediate JobRoles directly to hiring Companies with zero JOIN tables.',
    },
    {
      id: 'demand',
      title: '2. Highest Demand Skills by Graph In-Degree',
      query: `MATCH (s:Skill)-[:REQUIRED_FOR]->(j:JobRole)
RETURN s.name AS Skill, s.category AS Category, s.difficulty AS Difficulty, COUNT(j) AS RoleDemand
ORDER BY RoleDemand DESC
LIMIT 10;`,
      explanation:
        'Aggregates outgoing relationships from skills into job roles using native graph degree counting.',
    },
    {
      id: 'ai_eco',
      title: '3. Machine Learning Ecosystem & Frameworks',
      query: `MATCH (s:Skill {category: 'AI & Data'})-[:USED_WITH]->(t:Technology)
RETURN s.name AS AISkill, t.name AS Framework, t.type AS TechType;`,
      explanation:
        'Finds all companion machine learning libraries and runtime frameworks linked to AI skills.',
    },
    {
      id: 'co_tech',
      title: '4. Company Tech Stack Traversal (2 Hops)',
      query: `MATCH (c:Company {name: 'Google'})<-[:HIRED_BY]-(j:JobRole)<-[:USED_IN]-(t:Technology)
RETURN DISTINCT c.name AS Company, t.name AS TechStack, t.type AS Type
ORDER BY TechStack;`,
      explanation:
        'Discovers the technologies used across all open positions at a target company via inverse graph traversal.',
    },
    {
      id: 'shared_skills',
      title: '5. Skill Overlap Pattern Matching',
      query: `MATCH (j1:JobRole {title: 'AI/ML Engineer'})<-[:REQUIRED_FOR]-(s:Skill)-[:REQUIRED_FOR]->(j2:JobRole {title: 'Data Scientist'})
RETURN s.name AS SharedSkill, s.category AS Category;`,
      explanation:
        'Pattern matching two job roles that share common prerequisite skill nodes.',
    },
  ];

  const [query, setQuery] = useState<string>(templates[0].query);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(templates[0].id);
  const [results, setResults] = useState<any[] | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [copied, setCopied] = useState<boolean>(false);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const startTime = performance.now();
      const res = await api.runQuery(query);
      const endTime = performance.now();
      setResults(res.records || res.results || res.data || []);
      setExecutionTimeMs(Math.round(endTime - startTime));
    } catch (err: any) {
      setError(err.message || 'Error executing openCypher query.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (tmpl: any) => {
    setActiveTemplateId(tmpl.id);
    setQuery(tmpl.query);
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C87941]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Query Console</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            openCypher Playground
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Execute openCypher graph queries directly against the graph database engine over Bolt protocol.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="accent">Read-Only Sandbox</Badge>
          <Badge variant="tech">CognoDB Engine</Badge>
        </div>
      </div>

      {/* Preset Query Template Bar */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-4 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#A7A39A] flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C87941]" />
          <span>Preset openCypher Templates</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {templates.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                activeTemplateId === tmpl.id
                  ? 'bg-[#C87941]/20 text-[#E08C50] border border-[#C87941]/40'
                  : 'bg-[#11110F] text-[#A7A39A] hover:text-[#F2EFE7] border border-[#2E2E2A]'
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg overflow-hidden space-y-0">
        {/* Editor Toolbar */}
        <div className="px-4 py-2.5 bg-[#11110F] border-b border-[#2E2E2A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A7A39A]">
            <Code2 className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Cypher Query Buffer</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] rounded text-xs font-mono transition-colors flex items-center gap-1.5"
              title="Copy Query"
            >
              {copied ? <Check className="w-3 h-3 text-[#7A9A7B]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleRunQuery}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#C87941] hover:bg-[#D4864E] text-[#F2EFE7] text-xs font-mono rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>

        {/* Textarea Code Area */}
        <div className="p-4 bg-[#11110F]">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={5}
            className="w-full font-mono text-xs text-[#D8C7A5] bg-transparent border-0 focus:outline-none resize-y leading-relaxed"
            placeholder="MATCH (n) RETURN n LIMIT 25..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded bg-[#C0614E]/10 border border-[#C0614E]/30 flex items-start gap-2.5 text-[#D47562] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold font-mono">Query Execution Error</div>
            <div className="mt-1 font-mono text-[11px] text-[#A7A39A]">{error}</div>
          </div>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg overflow-hidden space-y-0">
          {/* Results Bar */}
          <div className="px-4 py-2.5 bg-[#11110F] border-b border-[#2E2E2A] flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-mono text-[#A7A39A]">
              <span className="text-[#F2EFE7]">Results ({results.length} records)</span>
              {executionTimeMs !== null && (
                <span className="flex items-center gap-1 text-[11px] text-[#6E6A62]">
                  <Clock className="w-3 h-3 text-[#6E6A62]" />
                  {executionTimeMs} ms
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-[#191917] p-0.5 rounded border border-[#2E2E2A]">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  viewMode === 'table' ? 'bg-[#22221F] text-[#F2EFE7]' : 'text-[#6E6A62] hover:text-[#A7A39A]'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  viewMode === 'json' ? 'bg-[#22221F] text-[#F2EFE7]' : 'text-[#6E6A62] hover:text-[#A7A39A]'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Records Table or JSON */}
          <div className="p-4 max-h-96 overflow-auto">
            {results.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-[#6E6A62]">
                Query executed successfully, returned 0 records.
              </div>
            ) : viewMode === 'table' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2E2E2A] text-[#A7A39A] bg-[#11110F]">
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="p-2 font-mono text-[11px] uppercase tracking-wider text-[#A7A39A]">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E2A]">
                  {results.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-[#22221F]/60">
                      {Object.values(row).map((val: any, valIdx) => (
                        <td key={valIdx} className="p-2 text-[#F2EFE7] font-mono text-[11px]">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="text-xs font-mono text-[#D8C7A5] p-3 bg-[#11110F] rounded overflow-x-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
