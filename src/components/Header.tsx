import React from 'react';
import { BarChart3, Database, FileSpreadsheet, Sparkles } from 'lucide-react';

interface HeaderProps {
  orderCount: number;
  onOpenRawData: () => void;
  onLoadSample: () => void;
  onScrollToAi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orderCount,
  onOpenRawData,
  onLoadSample,
  onScrollToAi,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Regional Quarterly Sales Intelligence
              </span>
              <div className="text-xs text-slate-500 hidden sm:block">
                Variance Analytics & AI Briefing Engine
              </div>
            </div>
          </div>

          {/* Zone 2: Clean single-line navigation & view links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#chart-view"
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              Revenue Chart
            </a>
            <a
              href="#table-view"
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              Matrix Table
            </a>
            <button
              onClick={onScrollToAi}
              className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Q2-Q3 AI Summary</span>
            </button>
            <button
              onClick={onOpenRawData}
              className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5 text-slate-600 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Orders ({orderCount})</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onLoadSample}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer shadow-xs"
              title="Load standard demo sales CSV dataset"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Load Sample CSV</span>
              <span className="sm:hidden">Sample</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
