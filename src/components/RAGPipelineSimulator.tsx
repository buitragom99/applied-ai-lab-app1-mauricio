import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Database, 
  FileText, 
  Cpu, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { RAGStepLog } from '../types';

export const RAGPipelineSimulator: React.FC = () => {
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [userQuery, setUserQuery] = useState<string>('How does speculative decoding accelerate LLM token generation?');

  const steps: RAGStepLog[] = [
    {
      step: 'query',
      title: '1. User Query Ingestion & Sanitation',
      status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'running' : 'idle',
      timeMs: 14,
      details: 'Clean query tokens, apply guardrails, and detect intent classification for RAG routing.',
      payload: { sanitizedQuery: userQuery, length: userQuery.length, intent: 'technical_retrieval' },
    },
    {
      step: 'embed',
      title: '2. Dense Vector Embedding Generation',
      status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'running' : 'idle',
      timeMs: 42,
      details: 'Generate 768-dimensional float32 dense embedding vector using text-embedding-004 model.',
      payload: { dimensions: 768, vectorSample: '[0.041, -0.892, 0.312, 0.054, ...]' },
    },
    {
      step: 'retrieve',
      title: '3. Vector Database Similarity Search (Top-K)',
      status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'running' : 'idle',
      timeMs: 28,
      details: 'Perform approximate nearest neighbor search (HNSW index) in pgvector / Pinecone with cosine threshold > 0.75.',
      payload: {
        topK: 2,
        chunks: [
          { id: 'chunk_82', score: 0.91, snippet: 'Speculative decoding utilizes a compact draft model to propose tokens validated in parallel by the target LLM.' },
          { id: 'chunk_14', score: 0.84, snippet: 'Parallel verification avoids autoregressive bottlenecks, achieving 2x-3x latency reduction.' }
        ]
      },
    },
    {
      step: 'augment',
      title: '4. Prompt Context Augmentation & Grounding',
      status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'running' : 'idle',
      timeMs: 12,
      details: 'Synthesize retrieved knowledge chunks into system prompt with strict anti-hallucination boundary tags.',
      payload: { promptTokens: 412, groundedChunks: 2, systemBoundary: 'ENFORCE_CITATION_LABELS' },
    },
    {
      step: 'generate',
      title: '5. Generative Model Synthesis with Citations',
      status: currentStepIndex > 4 ? 'completed' : currentStepIndex === 4 ? 'running' : 'idle',
      timeMs: 215,
      details: 'LLM generates final grounded response citing retrieved chunks [Chunk 82] and [Chunk 14].',
      payload: {
        finalAnswer: 'Speculative decoding accelerates LLM generation by pairing a smaller, rapid draft model with a larger target model [Chunk 82]. The draft model speculatively generates multiple candidate tokens which the target model verifies in parallel in a single forward pass, slashing autoregressive latency by 2x to 3x [Chunk 14].'
      },
    },
  ];

  const handleRunPipeline = () => {
    setPipelineState('running');
    setCurrentStepIndex(0);

    const timeouts = [400, 900, 1400, 1900, 2500];
    timeouts.forEach((delay, idx) => {
      setTimeout(() => {
        setCurrentStepIndex(idx);
        if (idx === timeouts.length - 1) {
          setPipelineState('completed');
        }
      }, delay);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              End-to-End RAG Pipeline Flow Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Lab Exercise 4: Trace the lifecycle of a Retrieval Augmented Generation pipeline from user input to vector retrieval, prompt grounding, and final answer generation.
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={pipelineState === 'running'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-all shadow-md ${
              pipelineState === 'running'
                ? 'bg-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {pipelineState === 'running' ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simulating Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute RAG Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Query Input */}
        <div className="mt-4">
          <label className="text-xs text-slate-300 font-semibold mb-1 block">Test Query:</label>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            disabled={pipelineState === 'running'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Pipeline Steps Tracker */}
      <div className="space-y-4">
        {steps.map((st, idx) => {
          const isDone = st.status === 'completed';
          const isCurrent = st.status === 'running';

          return (
            <div
              key={st.step}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-indigo-950/30 border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-md'
                  : isDone
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-indigo-500 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                  </div>
                  <div>
                    <h3 className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                      {st.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{st.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  {(isDone || isCurrent) && (
                    <span className="text-slate-400 text-[10px] flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {st.timeMs} ms
                    </span>
                  )}
                </div>
              </div>

              {/* Payload Details when active/done */}
              {(isDone || isCurrent) && (
                <div className="mt-3 pt-3 border-t border-slate-800/70">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-300 overflow-x-auto">
                    {st.step === 'generate' && st.payload.finalAnswer ? (
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Grounded LLM Response:
                        </span>
                        <p className="text-slate-200 leading-relaxed font-sans">{st.payload.finalAnswer}</p>
                      </div>
                    ) : (
                      <pre className="text-indigo-300">{JSON.stringify(st.payload, null, 2)}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
