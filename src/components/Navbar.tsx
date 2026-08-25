import React, { useState } from 'react';
import {
  Layers,
  Menu,
  X,
  Search,
  LayoutDashboard,
  Zap,
  Cpu,
  Briefcase,
  Building2,
  Share2,
  GitFork,
  Terminal,
} from 'lucide-react';
import { TabType } from './Sidebar';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-[#191917] border-b border-[#2E2E2A]">
      <div className="px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-7 h-7 rounded border border-[#C87941]/40 bg-[#C87941]/10 flex items-center justify-center text-[#C87941]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-editorial text-base text-[#F2EFE7]">SkillGraph</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] border border-[#2E2E2A] rounded transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A7A39A] hover:text-[#F2EFE7] bg-[#11110F] border border-[#2E2E2A] rounded transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-[#2E2E2A] bg-[#141412] space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
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
        </div>
      )}
    </header>
  );
};
