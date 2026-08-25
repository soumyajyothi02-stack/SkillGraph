import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { StatusBanner } from './components/Common/StatusBanner';
import { CypherModal } from './components/Common/CypherModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { SkillExplorerView } from './components/Skills/SkillExplorerView';
import { TechnologyExplorerView } from './components/Technologies/TechnologyExplorerView';
import { RoleExplorerView } from './components/Roles/RoleExplorerView';
import { CompanyExplorerView } from './components/Companies/CompanyExplorerView';
import { InteractiveGraphView } from './components/Graph/InteractiveGraphView';
import { ConnectionExplorerView } from './components/Connections/ConnectionExplorerView';
import { CypherPlaygroundView } from './components/Playground/CypherPlaygroundView';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';
import { HealthStatus } from './types/graph';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [targetEntityName, setTargetEntityName] = useState<string | undefined>(undefined);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Cypher Inspector Modal State
  const [cypherModal, setCypherModal] = useState<{
    isOpen: boolean;
    query: string;
    params?: any;
    title?: string;
    explanation?: string;
  }>({
    isOpen: false,
    query: '',
  });

  const checkHealth = async () => {
    try {
      const res = await api.checkHealth();
      setHealth(res);
    } catch (err) {
      console.error('Health check failed:', err);
      setHealth({
        connected: false,
        error: 'Unable to reach backend API',
        mode: 'memory_fallback',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleSeedDatabase = async () => {
    const res = await api.seedDatabase();
    await checkHealth();
    return res;
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleNavigate = (tab: TabType, entityName?: string) => {
    setTargetEntityName(entityName);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCypherInspector = (
    query: string,
    params?: any,
    title?: string,
    explanation?: string
  ) => {
    setCypherModal({
      isOpen: true,
      query,
      params,
      title,
      explanation,
    });
  };

  return (
    <div className="min-h-screen bg-[#11110F] text-[#F2EFE7] flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Navbar (hidden on lg) */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setTargetEntityName(undefined);
          setActiveTab(tab);
        }}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Desktop Sidebar (hidden on mobile, fixed on desktop) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setTargetEntityName(undefined);
            setActiveTab(tab);
          }}
          onOpenSearch={() => setSearchOpen(true)}
          health={health}
          onSeed={handleSeedDatabase}
          onRefreshHealth={checkHealth}
        />
      </div>

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 pb-12 space-y-6">
          {/* Top Status Banner (Mobile or Supplementary) */}
          <div className="lg:hidden">
            <StatusBanner
              health={health}
              onSeed={handleSeedDatabase}
              onRefreshHealth={checkHealth}
            />
          </div>

          {/* Dynamic Active View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              health={health}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'skills' && (
            <SkillExplorerView
              initialSkillName={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'technologies' && (
            <TechnologyExplorerView
              initialTechnologyName={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'roles' && (
            <RoleExplorerView
              initialRoleTitle={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'companies' && (
            <CompanyExplorerView
              initialCompanyName={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'graph' && (
            <InteractiveGraphView
              initialFocusNodeId={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'connections' && (
            <ConnectionExplorerView
              initialStartNode={targetEntityName}
              onNavigate={handleNavigate}
              onOpenCypherInspector={handleOpenCypherInspector}
            />
          )}

          {activeTab === 'playground' && <CypherPlaygroundView />}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#2E2E2A] bg-[#141412] py-4 px-6 text-xs text-[#6E6A62]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#A7A39A]">SkillGraph v1.2</span>
              <span>·</span>
              <span>CognoDB openCypher Engine</span>
            </div>
            <div className="font-mono text-[11px] text-[#6E6A62]">
              Bolt Protocol · Driver: neo4j-driver
            </div>
          </div>
        </footer>
      </div>

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* openCypher Query Inspector Modal */}
      <CypherModal
        isOpen={cypherModal.isOpen}
        onClose={() => setCypherModal((prev) => ({ ...prev, isOpen: false }))}
        query={cypherModal.query}
        params={cypherModal.params}
        title={cypherModal.title}
        explanation={cypherModal.explanation}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
