import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Cpu,
  Briefcase,
  Building2,
  Share2,
  GitFork,
  Terminal,
  Search,
  Database,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { HealthStatus } from '../types/graph';

export type TabType =
  | 'dashboard'
  | 'skills'
  | 'technologies'
  | 'roles'
  | 'companies'
  | 'graph'
  | 'connections'
  | 'playground';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  health: HealthStatus | null;
  onSeed: () => Promise<any>;
  onRefreshHealth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  health,
  onSeed,
  onRefreshHealth,
}) => {
  const [seeding, setSeeding] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'skills', label: 'Explore Skills', icon: <Zap className="w-4 h-4" /> },
    { id: 'technologies', label: 'Technologies', icon: <Cpu className="w-4 h-4" /> },
    { id: 'roles', label: 'Job Roles', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'companies', label: 'Companies', icon: <Building2 className="w-4 h-4" /> },
    { id: 'graph', label: 'Graph Explorer', icon: <Share2 className="w-4 h-4" /> },
    { id: 'connections', label: 'Connections', icon: <GitFork className="w-4 h-4" /> },
    { id: 'playground', label: 'openCypher Playground', icon: <Terminal className="w-4 h-4" /> },
  ];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeed();
    } finally {
      setSeeding(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshHealth();
    } finally {
      setRefreshing(false);
    }
  };

  const isConnected = health?.connected ?? true;
  const totalNodes = health?.stats
    ? health.stats.skillsCount +
      health.stats.technologiesCount +
      health.stats.jobRolesCount +
      health.stats.companiesCount
    : 55;
  const totalRels = health?.stats?.relationshipsCount ?? 65;

  return (
    <aside className="w-64 shrink-0 bg-[#191917] border-r border-[#2E2E2A] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand & Search */}
      <div className="p-5 space-y-4">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded border border-[#C87941]/40 bg-[#C87941]/10 flex items-center justify-center text-[#C87941] group-hover:border-[#C87941] transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-editorial text-lg tracking-tight text-[#F2EFE7]">
                SkillGraph
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#A7A39A] tracking-tight">
              CognoDB · Graph Intelligence
            </p>
          </div>
        </div>

        {/* Global Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#A7A39A] bg-[#11110F] hover:bg-[#22221F] hover:text-[#F2EFE7] border border-[#2E2E2A] rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#6E6A62]" />
            <span>Search graph...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-[#6E6A62] bg-[#191917] border border-[#2E2E2A] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#6E6A62]">
          Navigation
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors text-left ${
                  isActive
                    ? 'bg-[#22221F] text-[#F2EFE7] font-medium border-l-2 border-[#C87941]'
                    : 'text-[#A7A39A] hover:bg-[#22221F]/60 hover:text-[#F2EFE7] border-l-2 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#C87941]' : 'text-[#6E6A62]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database Status Panel at Bottom */}
      <div className="p-4 border-t border-[#2E2E2A] bg-[#141412] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-[#7A9A7B]' : 'bg-[#C0614E]'
              }`}
            ></span>
            <span className="text-[11px] font-mono text-[#A7A39A]">
              {isConnected ? 'CognoDB Active' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh database connection status"
              className="p-1 text-[#6E6A62] hover:text-[#F2EFE7] hover:bg-[#22221F] rounded transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              title="Seed database graph entities"
              className="px-2 py-0.5 text-[10px] font-mono text-[#D8C7A5] hover:text-[#F2EFE7] bg-[#22221F] hover:bg-[#2E2E2A] border border-[#2E2E2A] rounded transition-colors flex items-center gap-1"
            >
              <Sparkles className={`w-2.5 h-2.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding' : 'Seed'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#6E6A62] pt-1">
          <div className="bg-[#11110F] px-2 py-1 rounded border border-[#242420]">
            <span className="block text-[#A7A39A]">Nodes: {totalNodes}</span>
            <span className="text-[9px]">4 Types</span>
          </div>
          <div className="bg-[#11110F] px-2 py-1 rounded border border-[#242420]">
            <span className="block text-[#A7A39A]">Rels: {totalRels}</span>
            <span className="text-[9px]">Bolt Protocol</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
