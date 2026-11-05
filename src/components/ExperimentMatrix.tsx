import React, { useState } from 'react';
import { 
  SplitSquareVertical, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  Clock, 
  Layers
} from 'lucide-react';
import { ExperimentVariant } from '../types';

interface ExperimentMatrixProps {
  experiments: ExperimentVariant[];
  onDeleteExperiment: (id: string) => void;
  onAddSampleExperiment: () => void;
}

export const ExperimentMatrix: React.FC<ExperimentMatrixProps> = ({
  experiments,
  onDeleteExperiment,
  onAddSampleExperiment,
}) => {
  const [selectedExp, setSelectedExp] = useState<ExperimentVariant | null>(
    experiments.length > 0 ? experiments[0] : null
  );

  const avgLatency = experiments.length
    ? Math.round(experiments.reduce((acc, curr) => acc + curr.latencyMs, 0) / experiments.length)
    : 0;

  const lowRiskCount = experiments.filter((e) => e.scores.hallucinationRisk === 'Low').length;
  const safetyRate = experiments.length ? Math.round((lowRiskCount / experiments.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <SplitSquareVertical className="w-5 h-5 text-indigo-400" />
              Prompt Evaluation & A/B Experiment Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Lab Exercise 2: Benchmark multi-prompt iterations side-by-side, score quality vectors, and identify the optimal production balance between latency and accuracy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddSampleExperiment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Benchmark Variant</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" /> Total Variants
            </span>
            <p className="text-lg font-bold text-white mt-0.5">{experiments.length}</p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Avg Latency
            </span>
            <p className="text-lg font-bold text-white mt-0.5">{avgLatency} ms</p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Safety Score
            </span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{safetyRate}% Low Risk</p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-cyan-400" /> Eval Criteria
            </span>
            <p className="text-lg font-bold text-slate-200 mt-0.5">Automated Rubric</p>
          </div>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <SplitSquareVertical className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No experiments logged yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Execute a prompt in the "Prompt Playground" and click "Send to A/B Experiment Matrix", or load sample benchmark runs.
          </p>
          <button
            onClick={onAddSampleExperiment}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Load Sample Variants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Variants Table / Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {experiments.map((exp) => {
              const isSelected = selectedExp?.id === exp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/60 ring-1 ring-indigo-500/20 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">{exp.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                        T={exp.temperature}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExperiment(exp.id);
                        if (selectedExp?.id === exp.id) {
                          setSelectedExp(null);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete run"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Relevance</span>
                      <div className="font-semibold text-slate-200">{exp.scores.relevance}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Accuracy</span>
                      <div className="font-semibold text-slate-200">{exp.scores.accuracy}%</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Latency / Tokens</span>
                      <div className="font-semibold text-slate-200">{exp.latencyMs}ms / {exp.tokensUsed}t</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Hallucination Risk</span>
                      <div className="flex items-center gap-1 font-semibold">
                        {exp.scores.hallucinationRisk === 'Low' ? (
                          <span className="text-emerald-400 text-xs flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Low
                          </span>
                        ) : (
                          <span className="text-amber-400 text-xs flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> {exp.scores.hallucinationRisk}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Inspector (5 cols) */}
          <div className="lg:col-span-5">
            {selectedExp ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{selectedExp.name} Inspector</h3>
                    <p className="text-[11px] text-slate-400">Inference breakdown & evaluation</p>
                  </div>
                  <span className="text-xs text-indigo-400 font-mono">T={selectedExp.temperature}</span>
                </div>

                {/* Prompt used */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Full Prompt
                  </label>
                  <div className="mt-1 bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedExp.prompt}
                  </div>
                </div>

                {/* Model response */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Observed Model Response
                  </label>
                  <div className="mt-1 bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-300 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {selectedExp.output}
                  </div>
                </div>

                {/* Score breakdown bars */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Relevance Alignment</span>
                    <span className="text-indigo-400 font-mono font-medium">{selectedExp.scores.relevance}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedExp.scores.relevance}%` }} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Conciseness & Information Density</span>
                    <span className="text-violet-400 font-mono font-medium">{selectedExp.scores.conciseness}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-violet-500 h-full rounded-full" style={{ width: `${selectedExp.scores.conciseness}%` }} />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Strict Factual Accuracy</span>
                    <span className="text-cyan-400 font-mono font-medium">{selectedExp.scores.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${selectedExp.scores.accuracy}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                Select an experiment from the left list to inspect outputs and quality scores.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
