import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { PromptPlayground } from './components/PromptPlayground';
import { ExperimentMatrix } from './components/ExperimentMatrix';
import { VectorEmbeddingsDemo } from './components/VectorEmbeddingsDemo';
import { RAGPipelineSimulator } from './components/RAGPipelineSimulator';
import { LabReportModal } from './components/LabReportModal';
import { ExperimentVariant } from './types';
import { Github, ExternalLink, Terminal, Shield } from 'lucide-react';

const INITIAL_BENCHMARKS: ExperimentVariant[] = [
  {
    id: 'exp-init-1',
    name: 'Zero-Shot Sentiment (T=0.2)',
    prompt: 'Analyze review sentiment: "The AI model inference was rapid, but the UI was confusing." Output JSON.',
    systemInstruction: 'You are a strict JSON feedback extractor.',
    temperature: 0.2,
    output: '{\n  "sentimentScore": 3.6,\n  "sentimentLabel": "Mixed/Actionable",\n  "aspects": ["latency", "UI"]\n}',
    latencyMs: 245,
    tokensUsed: 68,
    scores: {
      relevance: 98,
      conciseness: 95,
      accuracy: 96,
      hallucinationRisk: 'Low',
    },
  },
  {
    id: 'exp-init-2',
    name: 'Creative Zero-Shot (T=0.85)',
    prompt: 'Draft an engaging summary of modern vector embeddings for software architects.',
    systemInstruction: 'You are a tech thought leader.',
    temperature: 0.85,
    output: 'Vector embeddings serve as the semantic compass of modern AI architectures, converting unstructured concepts into geometric coordinates where mathematical distance reflects contextual meaning.',
    latencyMs: 380,
    tokensUsed: 142,
    scores: {
      relevance: 90,
      conciseness: 85,
      accuracy: 91,
      hallucinationRisk: 'Medium',
    },
  },
  {
    id: 'exp-init-3',
    name: 'Grounded RAG QA (T=0.1)',
    prompt: 'Sources: [Chunk 1] Triton supports dynamic batching.\nQuestion: Does Triton support dynamic batching?',
    systemInstruction: 'Answer strictly using sources.',
    temperature: 0.1,
    output: 'Yes, according to [Chunk 1], Triton supports dynamic batching.',
    latencyMs: 198,
    tokensUsed: 54,
    scores: {
      relevance: 100,
      conciseness: 98,
      accuracy: 100,
      hallucinationRisk: 'Low',
    },
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('playground');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [experiments, setExperiments] = useState<ExperimentVariant[]>(() => {
    try {
      const saved = localStorage.getItem('applied_ai_lab_experiments');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_BENCHMARKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('applied_ai_lab_experiments', JSON.stringify(experiments));
    } catch {
      // Ignore
    }
  }, [experiments]);

  const handleAddExperiment = (exp: ExperimentVariant) => {
    setExperiments((prev) => [exp, ...prev]);
  };

  const handleDeleteExperiment = (id: string) => {
    setExperiments((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddSampleExperiment = () => {
    const sample: ExperimentVariant = {
      id: `exp-${Date.now()}`,
      name: `Chain-of-Thought Logic (T=0.15)`,
      prompt: 'Solve server rack power consumption calculation step by step.',
      systemInstruction: 'Break down all arithmetic steps in <thinking> tags before answering.',
      temperature: 0.15,
      output: '<thinking>1. Standby: 4.5 * 18 = 81 kWh\n2. Peak: 4.5 * 2.4 * 6 = 64.8 kWh\n3. Daily total: 145.8 kWh</thinking>\nTotal: 4,374 kWh over 30 days.',
      latencyMs: 310,
      tokensUsed: 165,
      scores: {
        relevance: 97,
        conciseness: 88,
        accuracy: 99,
        hallucinationRisk: 'Low',
      },
    };
    setExperiments((prev) => [sample, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        experimentsCount={experiments.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'playground' && (
          <PromptPlayground onAddExperiment={handleAddExperiment} />
        )}

        {activeTab === 'experiments' && (
          <ExperimentMatrix
            experiments={experiments}
            onDeleteExperiment={handleDeleteExperiment}
            onAddSampleExperiment={handleAddSampleExperiment}
          />
        )}

        {activeTab === 'embeddings' && <VectorEmbeddingsDemo />}

        {activeTab === 'rag' && <RAGPipelineSimulator />}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 mt-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Applied AI Lab 1</span>
            <span className="text-slate-600">&bull;</span>
            <span>Mauricio Buitrago</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-400 font-mono">buitragom99/applied-ai-lab-app1-mauricio</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vite 6 &bull; React 19 &bull; Tailwind v4</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Report Modal */}
      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        experiments={experiments}
      />
    </div>
  );
}

export default App;
