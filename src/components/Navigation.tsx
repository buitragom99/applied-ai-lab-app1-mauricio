import React from 'react';
import { 
  Sparkles, 
  FlaskConical, 
  SplitSquareVertical, 
  Network, 
  Layers, 
  FileCheck2, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';

export type ActiveTab = 'playground' | 'experiments' | 'embeddings' | 'rag';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenReport: () => void;
  experimentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenReport,
  experimentsCount,
}) => {
  const tabs = [
    { id: 'playground' as const, label: 'Prompt Playground', icon: Sparkles, badge: 'Interactive' },
    { id: 'experiments' as const, label: 'A/B Experiment Matrix', icon: SplitSquareVertical, badge: `${experimentsCount} Runs` },
    { id: 'embeddings' as const, label: 'Vector Similarity', icon: Network, badge: 'Cosine Demo' },
    { id: 'rag' as const, label: 'RAG Pipeline Simulator', icon: Layers, badge: '5-Step Flow' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Lab Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">Applied AI Lab 1</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workspace for <span className="text-slate-300 font-mono">buitragom99/applied-ai-lab-app1-mauricio</span>
              </p>
            </div>
          </div>

          {/* Runtime Status Badges */}
          <div className="hidden lg:flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dev Server Active (:3000)</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Node.js 22 Runtime</span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Lab Summary & Export</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/60 pt-2 pb-2.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-inner border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
