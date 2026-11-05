import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  Target, 
  Database, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import { VectorItem } from '../types';
import { KNOWLEDGE_BASE_ITEMS } from '../data/labPresets';

export const VectorEmbeddingsDemo: React.FC = () => {
  const [queryText, setQueryText] = useState<string>('How do transformer attention mechanisms process contextual tokens?');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [highlightedItem, setHighlightedItem] = useState<VectorItem | null>(null);

  // Simple deterministic pseudo-embedding simulation to calculate realistic cosine similarity
  const computeQuerySimilarity = (item: VectorItem): number => {
    const qLower = queryText.toLowerCase();
    const itemLower = item.text.toLowerCase();

    // Check keyword overlaps
    const qWords = qLower.split(/\W+/).filter(Boolean);
    let matchCount = 0;
    qWords.forEach((word) => {
      if (word.length > 3 && itemLower.includes(word)) {
        matchCount += 1;
      }
    });

    // Baseline category weights
    let catBonus = 0;
    if (qLower.includes('attention') || qLower.includes('transformer') || qLower.includes('model') || qLower.includes('rag')) {
      if (item.category === 'Tech & AI') catBonus = 0.55;
    } else if (qLower.includes('health') || qLower.includes('patient') || qLower.includes('clinical') || qLower.includes('hipaa')) {
      if (item.category === 'Healthcare') catBonus = 0.55;
    } else if (qLower.includes('trad') || qLower.includes('financ') || qLower.includes('credit') || qLower.includes('risk')) {
      if (item.category === 'Finance') catBonus = 0.55;
    } else if (qLower.includes('law') || qLower.includes('legal') || qLower.includes('patent') || qLower.includes('contract')) {
      if (item.category === 'Legal') catBonus = 0.55;
    }

    const rawSim = 0.35 + catBonus * 0.4 + (matchCount * 0.12);
    return Math.min(0.98, Math.max(0.12, parseFloat(rawSim.toFixed(3))));
  };

  const rankedItems = KNOWLEDGE_BASE_ITEMS
    .filter((item) => selectedCategory === 'All' || item.category === selectedCategory)
    .map((item) => ({
      item,
      similarity: computeQuerySimilarity(item),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
    'Tech & AI': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-500' },
    'Healthcare': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    'Finance': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
    'Legal': { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-500' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              Dense Embeddings & Vector Space Similarity
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Lab Exercise 3: Understand how multi-dimensional token embeddings capture semantic relationships and how vector databases use cosine similarity for retrieval.
            </p>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Type a semantic query to calculate cosine proximity..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Clusters</option>
              <option value="Tech & AI">Tech & AI</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap text-[11px] text-slate-400">
          <span className="text-slate-500">Quick tests:</span>
          {[
            'Transformer self-attention mechanism',
            'HIPAA patient EHR data privacy rules',
            'Low latency algorithmic trading execution',
            'Intellectual property patent litigation',
          ].map((promptSample) => (
            <button
              key={promptSample}
              onClick={() => setQueryText(promptSample)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            >
              {promptSample}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2D Spatial Scatter Plot (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              2D t-SNE / UMAP Semantic Projection
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Normalized Space (0-100)</span>
          </div>

          {/* Interactive visual canvas space */}
          <div className="relative w-full h-[360px] bg-slate-950 border border-slate-800/80 rounded-lg mt-3 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border-r border-b border-slate-900/60" />
              ))}
            </div>

            {/* Render knowledge items as nodes */}
            {KNOWLEDGE_BASE_ITEMS.map((item) => {
              const sim = computeQuerySimilarity(item);
              const isTop = rankedItems[0]?.item.id === item.id;
              const isHovered = highlightedItem?.id === item.id;
              const colorInfo = categoryColors[item.category] || { dot: 'bg-indigo-500' };

              return (
                <div
                  key={item.id}
                  onClick={() => setHighlightedItem(item)}
                  style={{ left: `${item.x}%`, top: `${100 - item.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                >
                  <div
                    className={`relative rounded-full transition-all duration-300 flex items-center justify-center ${
                      isTop
                        ? 'w-7 h-7 bg-indigo-500 text-white ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500/50 animate-pulse'
                        : isHovered
                        ? 'w-6 h-6 ring-2 ring-white scale-125'
                        : 'w-4 h-4 hover:scale-125'
                    } ${colorInfo.dot}`}
                  >
                    {isTop && <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-[10px] text-slate-200 z-30 transition-opacity">
                    <div className="font-semibold text-indigo-400 mb-0.5">{item.category}</div>
                    <div className="line-clamp-2">{item.text}</div>
                    <div className="mt-1 font-mono text-emerald-400">Cosine: {sim.toFixed(3)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cluster Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px]">
            {Object.entries(categoryColors).map(([cat, style]) => (
              <div key={cat} className="flex items-center gap-1.5 text-slate-300">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Ranked Similarity List (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Nearest Neighbors (Top-K Cosine Metric)
            </span>
            <span className="text-[10px] text-slate-400">{rankedItems.length} Chunks Indexed</span>
          </div>

          <div className="flex-1 mt-3 space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
            {rankedItems.map(({ item, similarity }, index) => {
              const isTop = index === 0;
              const colorInfo = categoryColors[item.category];

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHighlightedItem(item)}
                  onMouseLeave={() => setHighlightedItem(null)}
                  className={`p-3 rounded-lg border transition-all ${
                    isTop
                      ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/20'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isTop ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        #{index + 1}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colorInfo.bg} ${colorInfo.text}`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-slate-400 text-[10px]">cos(&theta;):</span>
                      <span className={`font-semibold ${similarity > 0.7 ? 'text-emerald-400' : similarity > 0.5 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {similarity.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    "{item.text}"
                  </p>

                  {/* Similarity gauge */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        similarity > 0.7 ? 'bg-emerald-500' : similarity > 0.5 ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${Math.round(similarity * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lab Explanation Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Mathematical Background: </span>
          Cosine similarity measures the orientation between two vectors in high-dimensional embedding space:
          <code className="text-indigo-300 font-mono mx-1">cos(&theta;) = (A &middot; B) / (||A|| ||B||)</code>.
          Unlike Euclidean distance, it is invariant to text length and vector magnitude, making it the industry standard for semantic search.
        </div>
      </div>
    </div>
  );
};
