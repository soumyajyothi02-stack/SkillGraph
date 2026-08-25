import React, { useState, useEffect } from 'react';
import {
  GitFork,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  Briefcase,
  Building2,
  Terminal,
  Route,
} from 'lucide-react';
import { api } from '../../services/api';
import { ConnectionPath } from '../../types/graph';
import { Badge } from '../Common/Badge';
import { CardSkeleton } from '../Common/LoadingSkeleton';
import { EmptyState } from '../Common/EmptyState';
import { ErrorBanner } from '../Common/ErrorBanner';
import { TabType } from '../Sidebar';

interface ConnectionExplorerViewProps {
  initialStartNode?: string;
  initialTargetNode?: string;
  onNavigate: (tab: TabType, entityName?: string) => void;
  onOpenCypherInspector: (query: string, params?: any, title?: string, explanation?: string) => void;
}

export const ConnectionExplorerView: React.FC<ConnectionExplorerViewProps> = ({
  initialStartNode,
  initialTargetNode,
  onNavigate,
  onOpenCypherInspector,
}) => {
  const [startNode, setStartNode] = useState<string>(initialStartNode || 'Python');
  const [targetNode, setTargetNode] = useState<string>(initialTargetNode || 'Google');
  const [startOptions, setStartOptions] = useState<string[]>([
    'Python',
    'Machine Learning',
    'Deep Learning',
    'Frontend Development',
    'Backend Development',
    'Distributed Systems',
    'SQL',
    'Cloud Computing',
    'React',
    'Java',
  ]);
  const [targetOptions, setTargetOptions] = useState<string[]>([
    'Google',
    'Microsoft',
    'Amazon',
    'NVIDIA',
    'Meta',
    'Apple',
    'Netflix',
    'Uber',
    'Spotify',
    'Airbnb',
  ]);
  const [paths, setPaths] = useState<ConnectionPath[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCypher, setActiveCypher] = useState<{ query: string; params: any } | null>(null);

  const featuredPairs = [
    { start: 'Python', target: 'Google', label: 'Python ➔ Google (AI & ML)' },
    { start: 'Frontend Development', target: 'Apple', label: 'Frontend ➔ Apple' },
    { start: 'Cloud Computing', target: 'Amazon', label: 'Cloud ➔ Amazon' },
    { start: 'Distributed Systems', target: 'Netflix', label: 'Distributed Systems ➔ Netflix' },
    { start: 'Machine Learning', target: 'NVIDIA', label: 'Machine Learning ➔ NVIDIA' },
    { start: 'React', target: 'Meta', label: 'React ➔ Meta' },
  ];

  // Fetch live options from CognoDB
  useEffect(() => {
    async function loadEntityOptions() {
      try {
        const [skillsRes, companiesRes] = await Promise.all([
          api.getSkills(),
          api.getCompanies(),
        ]);
        if (skillsRes.data && skillsRes.data.length > 0) {
          setStartOptions(skillsRes.data.map((s) => s.name));
        }
        if (companiesRes.data && companiesRes.data.length > 0) {
          setTargetOptions(companiesRes.data.map((c) => c.name));
        }
      } catch (err) {
        console.warn('Error loading dynamic dropdown entity options:', err);
      }
    }
    loadEntityOptions();
  }, []);

  const handleFindConnections = async (start = startNode, target = targetNode) => {
    if (!start || !target) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.findConnections(start, target);
      setPaths(res.paths || []);
      if (res.cypher) setActiveCypher(res.cypher);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to the SkillGraph database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialStartNode) {
      setStartNode(initialStartNode);
      handleFindConnections(initialStartNode, targetNode);
    }
  }, [initialStartNode]);

  useEffect(() => {
    if (initialTargetNode) {
      setTargetNode(initialTargetNode);
      handleFindConnections(startNode, initialTargetNode);
    }
  }, [initialTargetNode]);

  useEffect(() => {
    handleFindConnections();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2E2E2A] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C87941]" />
            <span className="text-xs font-mono uppercase text-[#A7A39A]">Traversal Explorer</span>
          </div>
          <h1 className="font-editorial text-3xl text-[#F2EFE7]">
            Connection Paths
          </h1>
          <p className="text-xs text-[#A7A39A] mt-1 max-w-xl">
            Traverse multi-hop relationships from learning competencies to hiring targets across CognoDB.
          </p>
        </div>

        {activeCypher && (
          <button
            onClick={() =>
              onOpenCypherInspector(
                activeCypher.query,
                activeCypher.params,
                `Multi-Hop Traversal (${startNode} ➔ ${targetNode})`,
                'Executes variable-length path traversal [*1..4] to discover all shortest graph paths between start and target nodes without relational join penalties.'
              )
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-[#F2EFE7] bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors shrink-0 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C87941]" />
            <span>Inspect openCypher Traversal</span>
          </button>
        )}
      </div>

      {/* Traversal Selector Card */}
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Node Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#C87941] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Starting Skill / Competency</span>
            </label>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="w-full px-3 py-2 bg-[#11110F] border border-[#2E2E2A] rounded text-xs text-[#F2EFE7] font-mono focus:outline-none focus:border-[#C87941] transition-colors"
            >
              {startOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Target Node Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#C0614E] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Target Organization</span>
            </label>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="w-full px-3 py-2 bg-[#11110F] border border-[#2E2E2A] rounded text-xs text-[#F2EFE7] font-mono focus:outline-none focus:border-[#C87941] transition-colors"
            >
              {targetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button & Preset Quick Traversal Pairs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#2E2E2A]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#A7A39A]">
            <span className="font-mono text-[#6E6A62]">Presets:</span>
            {featuredPairs.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setStartNode(p.start);
                  setTargetNode(p.target);
                  handleFindConnections(p.start, p.target);
                }}
                className="px-2.5 py-1 bg-[#11110F] hover:bg-[#22221F] border border-[#2E2E2A] text-[#A7A39A] hover:text-[#F2EFE7] rounded text-xs font-mono transition-colors"
              >
                {p.start} ➔ {p.target}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleFindConnections(startNode, targetNode)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C87941] hover:bg-[#D4864E] text-[#F2EFE7] text-xs font-mono rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Traversing...' : 'Find Paths'}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={() => handleFindConnections(startNode, targetNode)} />}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#A7A39A] flex items-center gap-2">
          <Route className="w-3.5 h-3.5 text-[#C87941]" />
          <span>
            Connected Paths ({paths.length}) for <span className="text-[#C87941]">{startNode}</span> ➔ <span className="text-[#C0614E]">{targetNode}</span>
          </span>
        </h2>
        {paths.length > 0 && (
          <span className="text-xs font-mono text-[#6E6A62]">
            Shortest path traversal (hops)
          </span>
        )}
      </div>

      {/* Results List */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : paths.length === 0 ? (
        <EmptyState
          title="No direct or multi-hop path found"
          description={`No path between "${startNode}" and "${targetNode}" was found within 4 graph hops. Try choosing an AI or Web Development skill.`}
          actionText="Try Python ➔ Google"
          onAction={() => {
            setStartNode('Python');
            setTargetNode('Google');
            handleFindConnections('Python', 'Google');
          }}
        />
      ) : (
        <div className="space-y-3">
          {paths.map((p, idx) => (
            <div
              key={p.pathId}
              className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-4 space-y-3"
            >
              {/* Path Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2E2E2A]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#11110F] border border-[#2E2E2A] text-[#D8C7A5] flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono text-[#F2EFE7]">
                    Path Variant #{idx + 1}
                  </span>
                </div>
                <Badge variant="accent">
                  {p.hopCount} {p.hopCount === 1 ? 'Hop' : 'Hops'}
                </Badge>
              </div>

              {/* Hop-by-Hop Visual Nodes Chain */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                {p.nodes.map((node, nodeIdx) => {
                  const rel = p.relationships[nodeIdx];
                  const isLast = nodeIdx === p.nodes.length - 1;

                  return (
                    <React.Fragment key={`${node.id}-${nodeIdx}`}>
                      {/* Node Box */}
                      <div
                        onClick={() => {
                          if (node.label === 'Skill') onNavigate('skills', node.id);
                          else if (node.label === 'Technology') onNavigate('technologies', node.id);
                          else if (node.label === 'JobRole') onNavigate('roles', node.id);
                          else if (node.label === 'Company') onNavigate('companies', node.id);
                          else onNavigate('graph', node.id);
                        }}
                        className={`p-2.5 rounded border cursor-pointer transition-colors flex items-center gap-2 bg-[#11110F] ${
                          node.label === 'Skill'
                            ? 'border-[#C87941]/40 hover:border-[#C87941]'
                            : node.label === 'Technology'
                            ? 'border-[#D8C7A5]/40 hover:border-[#D8C7A5]'
                            : node.label === 'JobRole'
                            ? 'border-[#7A9A7B]/40 hover:border-[#7A9A7B]'
                            : 'border-[#C0614E]/40 hover:border-[#C0614E]'
                        }`}
                      >
                        {node.label === 'Skill' && <Zap className="w-3.5 h-3.5 text-[#C87941]" />}
                        {node.label === 'Technology' && <Cpu className="w-3.5 h-3.5 text-[#D8C7A5]" />}
                        {node.label === 'JobRole' && <Briefcase className="w-3.5 h-3.5 text-[#7A9A7B]" />}
                        {node.label === 'Company' && <Building2 className="w-3.5 h-3.5 text-[#C0614E]" />}

                        <div>
                          <div className="text-xs font-medium text-[#F2EFE7]">
                            {node.name || node.title || node.id}
                          </div>
                          <div className="text-[10px] font-mono text-[#A7A39A]">
                            {node.label}
                            {node.category ? ` · ${node.category}` : ''}
                            {node.experienceLevel ? ` · ${node.experienceLevel}` : ''}
                          </div>
                        </div>
                      </div>

                      {/* Relationship Arrow Connector */}
                      {!isLast && (
                        <div className="flex flex-col items-center px-1">
                          <span className="text-[9px] text-[#A7A39A] font-mono">
                            {rel?.type ? `:${rel.type}` : '➔'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-[#6E6A62]" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Traversal Summary Text */}
              <div className="p-2.5 bg-[#11110F] rounded border border-[#2E2E2A] text-xs font-mono text-[#A7A39A] flex items-center justify-between">
                <span>
                  Trajectory: <strong className="text-[#F2EFE7]">{p.formattedPath}</strong>
                </span>
                <button
                  onClick={() => onNavigate('graph', p.nodes[0]?.id)}
                  className="text-xs text-[#C87941] hover:text-[#D4864E] underline transition-colors cursor-pointer"
                >
                  View in Graph
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
