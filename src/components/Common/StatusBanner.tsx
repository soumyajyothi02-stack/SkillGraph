import React, { useState } from 'react';
import { RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { HealthStatus } from '../../types/graph';

interface StatusBannerProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  onSeed: () => Promise<any>;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  health,
  onRefreshHealth,
  onSeed,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [loading, setLoading] = useState(false);

  const isConnected = health?.connected ?? false;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeed();
    } finally {
      setSeeding(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRefreshHealth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#191917] border border-[#2E2E2A] text-xs font-mono text-[#A7A39A] px-4 py-2 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#7A9A7B]' : 'bg-[#D8C7A5]'}`} />
            <span className="text-[#F2EFE7]">
              {isConnected ? 'CognoDB Active (Bolt)' : 'CognoDB Runtime Ready'}
            </span>
          </div>

          <span className="hidden sm:inline text-[#2E2E2A]">|</span>

          <div className="hidden sm:flex items-center gap-3 text-[#A7A39A]">
            <span>
              Driver: <strong className="text-[#D8C7A5]">neo4j-driver</strong>
            </span>
            <span>
              Lang: <strong className="text-[#D8C7A5]">openCypher</strong>
            </span>
            {health?.stats && (
              <span>
                Nodes: <strong className="text-[#F2EFE7]">{health.stats.skillsCount + health.stats.technologiesCount + health.stats.jobRolesCount + health.stats.companiesCount}</strong>
                {' '}· Rels: <strong className="text-[#F2EFE7]">{health.stats.relationshipsCount}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[#6E6A62] hover:text-[#A7A39A] underline decoration-[#2E2E2A] transition-colors"
          >
            {showDetails ? 'Hide Spec' : 'Graph Spec'}
          </button>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors disabled:opacity-50"
            title="Seed CognoDB graph data model with MERGE statements"
          >
            <Sparkles className={`w-3 h-3 text-[#C87941] ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding...' : 'Seed Data'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1 text-[#6E6A62] hover:text-[#F2EFE7] hover:bg-[#22221F] rounded transition-colors"
            title="Refresh database connection status"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Details Tray */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#2E2E2A] grid grid-cols-1 md:grid-cols-3 gap-3 text-[#A7A39A] text-xs font-mono">
          <div className="p-3 bg-[#11110F] rounded border border-[#2E2E2A]">
            <span className="font-semibold text-[#F2EFE7] block mb-1">Graph Model Schema</span>
            <p>
              Labels: <code className="text-[#C87941]">Skill</code>, <code className="text-[#D8C7A5]">Technology</code>, <code className="text-[#7A9A7B]">JobRole</code>, <code className="text-[#C0614E]">Company</code>
            </p>
            <p className="mt-1">
              Rels: <code className="text-[#A7A39A]">:USED_WITH</code>, <code className="text-[#A7A39A]">:REQUIRED_FOR</code>, <code className="text-[#A7A39A]">:USED_IN</code>, <code className="text-[#A7A39A]">:HIRED_BY</code>, <code className="text-[#A7A39A]">:RELATED_TO</code>
            </p>
          </div>

          <div className="p-3 bg-[#11110F] rounded border border-[#2E2E2A]">
            <span className="font-semibold text-[#F2EFE7] block mb-1">Security & Environment</span>
            <p>
              Configured via server-side <code className="text-[#D8C7A5]">COGNODB_URI</code>, <code className="text-[#D8C7A5]">COGNODB_USERNAME</code>, <code className="text-[#D8C7A5]">COGNODB_PASSWORD</code>.
            </p>
            <p className="mt-1 text-[#6E6A62]">
              Credentials remain isolated and are never transmitted to client browsers.
            </p>
          </div>

          <div className="p-3 bg-[#11110F] rounded border border-[#2E2E2A] flex flex-col justify-between">
            <div>
              <span className="font-semibold text-[#F2EFE7] block mb-1">Parameterized Traversal</span>
              <p>
                All graph queries invoke Cypher pattern matching via official <code className="text-[#D8C7A5]">neo4j-driver</code> sessions.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[#7A9A7B] mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Injection-safe Parameter Binding</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
