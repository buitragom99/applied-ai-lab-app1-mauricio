import React, { useState } from 'react';
import { 
  Play, 
  Settings2, 
  Sliders, 
  RotateCcw, 
  Copy, 
  Check, 
  SendHorizontal, 
  Clock, 
  Cpu, 
  FileCode2, 
  Sparkles,
  Info
} from 'lucide-react';
import { ModelConfig, PromptTemplate, ExperimentVariant } from '../types';
import { LAB_TEMPLATES } from '../data/labPresets';

interface PromptPlaygroundProps {
  onAddExperiment: (exp: ExperimentVariant) => void;
}

export const PromptPlayground: React.FC<PromptPlaygroundProps> = ({ onAddExperiment }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(LAB_TEMPLATES[0].id);
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate>(LAB_TEMPLATES[0]);

  // Model parameters
  const [config, setConfig] = useState<ModelConfig>({
    modelName: 'gemini-2.5-flash',
    temperature: 0.2,
    topP: 0.95,
    maxTokens: 1024,
    systemInstruction: activeTemplate.systemInstruction,
  });

  const [userPromptText, setUserPromptText] = useState<string>(activeTemplate.userPrompt);
  const [variableInput, setVariableInput] = useState<string>(activeTemplate.sampleInput);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [latency, setLatency] = useState<number | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [sentToast, setSentToast] = useState<boolean>(false);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = LAB_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setActiveTemplate(tmpl);
      setUserPromptText(tmpl.userPrompt);
      setVariableInput(tmpl.sampleInput);
      setConfig((prev) => ({
        ...prev,
        systemInstruction: tmpl.systemInstruction,
      }));
      setOutput('');
      setLatency(null);
      setTokensUsed(null);
    }
  };

  const handleRunPrompt = () => {
    setIsRunning(true);
    setOutput('');
    const startTime = performance.now();

    // Compile final prompt by replacing {{input}}
    const finalPrompt = userPromptText.replace(/\{\{input\}\}/g, variableInput);

    setTimeout(() => {
      const execLatency = Math.round(performance.now() - startTime + 240 + Math.random() * 80);
      const estTokens = Math.round(finalPrompt.length / 3.8 + 65 + Math.random() * 20);

      // Generate contextually accurate AI output based on template & params
      let simulatedResponse = '';
      if (activeTemplate.id === 'template-sentiment') {
        const isPos = variableInput.toLowerCase().includes('fast') || variableInput.toLowerCase().includes('great');
        simulatedResponse = JSON.stringify({
          sentimentScore: isPos ? 4.2 : 2.4,
          sentimentLabel: isPos ? 'Positive with actionable critique' : 'Neutral / Mixed',
          aspects: [
            { topic: 'Model Speed', sentiment: 'Positive', quote: 'blazingly fast' },
            { topic: 'Accuracy', sentiment: 'Positive', quote: 'accurate' },
            { topic: 'User Interface', sentiment: 'Negative', quote: 'felt cluttered' },
            { topic: 'React Documentation', sentiment: 'Negative', quote: 'lacked code examples' }
          ],
          actionableSummary: 'High customer satisfaction regarding core AI inference speed. Priority remediation recommended for UI component hierarchy and React SDK developer quickstart guides.'
        }, null, 2);
      } else if (activeTemplate.id === 'template-cot') {
        simulatedResponse = `<thinking>
1. Calculate daily standby consumption:
   - Standby rate = 4.5 kWh/hour
   - Standby hours during peak days = 24 - 6 = 18 hours/day
   - Standby power per day = 18 hrs * 4.5 kWh = 81.0 kWh

2. Calculate peak inference hours consumption:
   - Spike = +140% -> Multiplier = 1 + 1.40 = 2.40x
   - Peak power rate = 4.5 * 2.40 = 10.8 kWh/hour
   - Peak hours per day = 6 hours
   - Peak power per day = 6 hrs * 10.8 kWh = 64.8 kWh

3. Total daily consumption = 81.0 + 64.8 = 145.8 kWh/day
4. Total over 30 days = 145.8 * 30 = 4,374.0 kWh
</thinking>

Final Answer:
The server rack will consume exactly 4,374 kWh over the 30-day billing cycle.`;
      } else if (activeTemplate.id === 'template-rag-synthesis') {
        simulatedResponse = `Based strictly on the provided references:
1. Dynamic batching delay in Triton is controlled by \`max_queue_delay_microseconds = 100\` [Chunk 1].
2. Yes, INT8 quantization directly reduces the model VRAM footprint from FP16 while maintaining minimal accuracy degradation [Chunk 2].`;
      } else {
        simulatedResponse = JSON.stringify({
          candidateName: 'Mauricio Buitrago',
          experienceYears: 5,
          coreCompetencies: ['PyTorch', 'LangChain', 'Vector Search & Embeddings', 'Node.js', 'React'],
          academicCredentials: {
            degree: 'M.S. in Computer Science',
            field: 'Applied Artificial Intelligence'
          },
          domainReadiness: 'Production Senior / Lead AI Systems Engineer'
        }, null, 2);
      }

      setOutput(simulatedResponse);
      setLatency(execLatency);
      setTokensUsed(estTokens);
      setIsRunning(false);
    }, 450);
  };

  const handleSendToMatrix = () => {
    if (!output) return;
    const finalPrompt = userPromptText.replace(/\{\{input\}\}/g, variableInput);

    const newExperiment: ExperimentVariant = {
      id: `exp-${Date.now()}`,
      name: `${activeTemplate.title.slice(0, 22)} (T=${config.temperature})`,
      prompt: finalPrompt,
      systemInstruction: config.systemInstruction,
      temperature: config.temperature,
      output,
      latencyMs: latency || 310,
      tokensUsed: tokensUsed || 140,
      scores: {
        relevance: 95,
        conciseness: config.temperature < 0.4 ? 92 : 84,
        accuracy: 96,
        hallucinationRisk: config.temperature > 0.7 ? 'Medium' : 'Low',
      },
    };

    onAddExperiment(newExperiment);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 2400);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Prompt Engineering & Parameters Workbench
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Lab Exercise 1: Formulate structured system instructions, evaluate zero-shot vs few-shot prompt templates, and analyze how temperature affects token entropy.
            </p>
          </div>

          {/* Template Selector dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Lab Template:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {LAB_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  [{tmpl.category}] {tmpl.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt inputs & Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* System Instruction */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
                System Instruction (Persona & Constraints)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">system role</span>
            </div>
            <textarea
              rows={3}
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              placeholder="e.g. You are a strict JSON extractor..."
            />
          </div>

          {/* User Prompt Template */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                Prompt Structure (Supports <code className="text-indigo-300 bg-indigo-500/10 px-1 rounded font-mono">{"{{input}}"}</code> variable)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">user template</span>
            </div>
            <textarea
              rows={5}
              value={userPromptText}
              onChange={(e) => setUserPromptText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Variable Input Value */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Variable Payload for <code className="text-indigo-300 bg-indigo-500/10 px-1 rounded font-mono">{"{{input}}"}</code>
              </label>
              <button
                onClick={() => setVariableInput(activeTemplate.sampleInput)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Reset Sample
              </button>
            </div>
            <textarea
              rows={3}
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
              placeholder="Enter dynamic test data here..."
            />
          </div>

          {/* Model Parameter Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-3">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Inference Hyperparameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Temperature</span>
                  <span className="text-indigo-400 font-mono font-medium">{config.temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">Lower = deterministic</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Top-P</span>
                  <span className="text-indigo-400 font-mono font-medium">{config.topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.topP}
                  onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">Nucleus sampling threshold</p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Max Tokens</span>
                  <span className="text-indigo-400 font-mono font-medium">{config.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={config.maxTokens}
                  onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">Output ceiling limit</p>
              </div>
            </div>
          </div>

          {/* Run Action Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunPrompt}
              disabled={isRunning}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs text-white transition-all shadow-md ${
                isRunning
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] shadow-indigo-600/25'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Inferencing Model...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Prompt Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output & Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[540px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Model Inference Output
              </span>
              <div className="flex items-center gap-2">
                {output && (
                  <button
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 text-xs flex items-center gap-1"
                    title="Copy output"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Output view container */}
            <div className="flex-1 my-3 bg-slate-950 border border-slate-800/80 rounded-lg p-3 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {isRunning ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Computing token probabilities...</span>
                </div>
              ) : output ? (
                output
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                  <Play className="w-8 h-8 text-slate-700 mb-2 stroke-1" />
                  <p className="text-xs text-slate-400">No output generated yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Configure your prompt and click "Execute Prompt Test".</p>
                </div>
              )}
            </div>

            {/* Metrics footer */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded-md border border-slate-800/60">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Latency:</span>
                <span className="text-slate-200 font-mono font-medium">{latency !== null ? `${latency} ms` : '--'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded-md border border-slate-800/60">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tokens:</span>
                <span className="text-slate-200 font-mono font-medium">{tokensUsed !== null ? `~${tokensUsed}` : '--'}</span>
              </div>
            </div>

            {/* Matrix Action */}
            {output && (
              <div className="mt-3">
                <button
                  onClick={handleSendToMatrix}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-all"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Send to A/B Experiment Matrix</span>
                </button>
                {sentToast && (
                  <p className="text-center text-[11px] text-emerald-400 mt-1.5 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Added to Matrix! Check the A/B Experiment tab.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Educational Note */}
          <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Lab Tip: </span>
              Zero-shot prompts with high temperature (&gt;0.7) introduce creative variance but increase hallucination risks in structured data extraction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
