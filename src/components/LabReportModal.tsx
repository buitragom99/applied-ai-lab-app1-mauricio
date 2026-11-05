import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  CheckCircle2, 
  Award,
  Sparkles 
} from 'lucide-react';
import { ExperimentVariant } from '../types';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiments: ExperimentVariant[];
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  experiments,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('Mauricio Buitrago');
  const [courseName] = useState<string>('Applied AI Lab 1');

  if (!isOpen) return null;

  const generateMarkdownReport = (): string => {
    return `# ${courseName} — Lab Assignment Report
**Student**: ${studentName}
**Repository**: buitragom99/applied-ai-lab-app1-mauricio
**Date**: ${new Date().toISOString().split('T')[0]}
**Runtime**: Node.js 22 (AI Studio Dev Environment :3000)

## Executive Summary
This laboratory report evaluates prompt engineering techniques, inference hyperparameter tuning, dense vector embedding similarity metrics, and end-to-end Retrieval Augmented Generation (RAG) pipelines.

## Benchmark Experiments Logged (${experiments.length} Variants)
${experiments
  .map(
    (exp, idx) => `
### Experiment ${idx + 1}: ${exp.name}
- **Temperature**: ${exp.temperature}
- **Latency**: ${exp.latencyMs} ms
- **Estimated Tokens**: ${exp.tokensUsed}
- **Relevance Alignment**: ${exp.scores.relevance}%
- **Strict Factual Accuracy**: ${exp.scores.accuracy}%
- **Hallucination Risk**: ${exp.scores.hallucinationRisk}

**Prompt**:
\`\`\`
${exp.prompt}
\`\`\`

**Model Output**:
\`\`\`
${exp.output}
\`\`\`
`
  )
  .join('\n---\n')}

## Key Findings & Conclusion
1. **Temperature Sensitivity**: Lower temperatures (0.1 - 0.3) are essential for structured JSON extraction and RAG synthesis to avoid extraneous tokens.
2. **Chain-of-Thought (CoT)**: Enforcing intermediate deduction tokens drastically reduces computational logic bugs in multi-step quantitative queries.
3. **Dense Vector Search**: Cosine similarity on dense embeddings provides invariant orientation matching across domain-specific corpora.
`;
  };

  const reportText = generateMarkdownReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Applied_AI_Lab1_Report_${studentName.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Applied AI Lab Report & Submission</h3>
              <p className="text-xs text-slate-400">Export formatted laboratory findings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Student Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Course Module:</label>
              <div className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-indigo-400 mt-1 font-medium">
                {courseName}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300">Generated Markdown Preview:</span>
              <span className="text-[11px] text-slate-500">{experiments.length} experiments included</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {reportText}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
