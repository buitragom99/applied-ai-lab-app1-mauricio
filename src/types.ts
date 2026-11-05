export interface ModelConfig {
  modelName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemInstruction: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'Classification' | 'Extraction' | 'RAG' | 'Reasoning' | 'Creative';
  description: string;
  systemInstruction: string;
  userPrompt: string;
  sampleInput: string;
  expectedOutputFormat: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  prompt: string;
  systemInstruction?: string;
  temperature: number;
  output: string;
  latencyMs: number;
  tokensUsed: number;
  scores: {
    relevance: number;
    conciseness: number;
    accuracy: number;
    hallucinationRisk: 'Low' | 'Medium' | 'High';
  };
}

export interface VectorItem {
  id: string;
  category: 'Tech & AI' | 'Healthcare' | 'Finance' | 'Legal';
  text: string;
  vector: number[];
  x: number;
  y: number;
}

export interface RAGStepLog {
  step: 'query' | 'embed' | 'retrieve' | 'augment' | 'generate';
  title: string;
  status: 'idle' | 'running' | 'completed';
  timeMs: number;
  details: string;
  payload?: any;
}

export interface LabSubmission {
  studentName: string;
  labTitle: string;
  completedDate: string;
  notes: string;
  experimentsCompleted: number;
}
