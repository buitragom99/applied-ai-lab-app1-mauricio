import { PromptTemplate, VectorItem } from '../types';

export const LAB_TEMPLATES: PromptTemplate[] = [
  {
    id: 'template-sentiment',
    title: 'Zero-Shot Sentiment & Aspect Extractor',
    category: 'Classification',
    description: 'Classify sentiment score (1-5) and extract key topic entities from customer feedback.',
    systemInstruction: 'You are an analytical customer feedback extraction engine. Always output strictly valid JSON with keys: "sentimentScore", "sentimentLabel", "aspects", and "actionableSummary".',
    userPrompt: 'Analyze the following review:\n\nReview: "{{input}}"\n\nJSON output:',
    sampleInput: 'The AI model response was blazingly fast and accurate, but the user interface felt cluttered and the documentation lacked code examples for React.',
    expectedOutputFormat: '{"sentimentScore": 3.8, "sentimentLabel": "Positive with reservations", "aspects": ["latency", "accuracy", "UI", "documentation"]}'
  },
  {
    id: 'template-cot',
    title: 'Chain-of-Thought Math & Logic Reasoning',
    category: 'Reasoning',
    description: 'Enforce step-by-step reasoning tokens before arriving at the final answer to prevent logic bugs.',
    systemInstruction: 'You are an expert Applied AI reasoning assistant. Before providing the final conclusion, explicitly write <thinking>...</thinking> breaking down each logical deduction step.',
    userPrompt: 'Solve the problem:\n{{input}}\n\nStep-by-step solution:',
    sampleInput: 'A server rack consumes 4.5 kWh in standby. During peak AI model inference batching, consumption spikes by 140% for 6 hours daily. How many kWh are consumed over 30 days?',
    expectedOutputFormat: '<thinking>1. Standby rate = 4.5 kWh... 2. Peak rate = 4.5 * 2.4 = 10.8 kWh...</thinking> Final Answer: ...'
  },
  {
    id: 'template-rag-synthesis',
    title: 'Context-Grounded Question Answering (Anti-Hallucination)',
    category: 'RAG',
    description: 'Answer strictly using retrieved source chunks with explicit citation tags [Chunk 1].',
    systemInstruction: 'You are a strictly grounded factual assistant. ONLY answer using facts present in the provided Sources. If the information is missing, answer "Information not present in provided sources". Do not extrapolate.',
    userPrompt: 'Sources:\n[Chunk 1] The Triton inference server supports dynamic batching with max_queue_delay_microseconds = 100.\n[Chunk 2] Quantization reduces model VRAM footprint from FP16 to INT8 with minimal accuracy degradation.\n\nQuestion: {{input}}\n\nAnswer with citations:',
    sampleInput: 'What setting controls dynamic batching delay in Triton, and does INT8 reduce memory usage?',
    expectedOutputFormat: 'According to [Chunk 1], dynamic batching delay is controlled by `max_queue_delay_microseconds`. According to [Chunk 2], INT8 reduces memory usage.'
  },
  {
    id: 'template-json-extractor',
    title: 'Structured Resume & Skill Extractor',
    category: 'Extraction',
    description: 'Transforms unstructured professional bios into structured candidate skill profiles.',
    systemInstruction: 'You are a resume parsing AI. Extract technical competencies, years of experience, and highest degree into clean JSON.',
    userPrompt: 'Profile bio:\n{{input}}\n\nStructured JSON:',
    sampleInput: 'Mauricio Buitrago has spent 5 years developing machine learning pipelines with PyTorch, LangChain, and vector databases. He holds an M.S. in Computer Science.',
    expectedOutputFormat: '{"name": "Mauricio Buitrago", "experienceYears": 5, "skills": ["PyTorch", "LangChain", "Vector Databases"], "degree": "M.S. in Computer Science"}'
  }
];

export const KNOWLEDGE_BASE_ITEMS: VectorItem[] = [
  {
    id: 'v-1',
    category: 'Tech & AI',
    text: 'Large Language Models utilize multi-head self-attention mechanisms to weigh contextual token relations.',
    vector: [0.89, 0.12, 0.45],
    x: 75,
    y: 82
  },
  {
    id: 'v-2',
    category: 'Tech & AI',
    text: 'Vector search indexes like HNSW and ScaNN enable approximate nearest neighbor lookup in milliseconds.',
    vector: [0.92, 0.08, 0.38],
    x: 82,
    y: 78
  },
  {
    id: 'v-3',
    category: 'Tech & AI',
    text: 'Retrieval Augmented Generation (RAG) grounds generative models on external knowledge repositories.',
    vector: [0.85, 0.22, 0.49],
    x: 70,
    y: 74
  },
  {
    id: 'v-4',
    category: 'Healthcare',
    text: 'Clinical decision support algorithms require rigorous validation against patient demographic biases.',
    vector: [0.15, 0.88, 0.31],
    x: 25,
    y: 80
  },
  {
    id: 'v-5',
    category: 'Healthcare',
    text: 'Electronic Health Records (EHR) privacy mandates strict HIPAA de-identification compliance before AI training.',
    vector: [0.22, 0.91, 0.24],
    x: 30,
    y: 88
  },
  {
    id: 'v-6',
    category: 'Finance',
    text: 'High-frequency algorithmic trading strategies leverage ultra-low latency FPGA networking interfaces.',
    vector: [0.42, 0.25, 0.88],
    x: 78,
    y: 28
  },
  {
    id: 'v-7',
    category: 'Finance',
    text: 'Credit risk assessment scorecards model default probability using gradient boosted decision trees.',
    vector: [0.48, 0.31, 0.82],
    x: 82,
    y: 20
  },
  {
    id: 'v-8',
    category: 'Legal',
    text: 'Intellectual property litigation requires precise precedent comparison across circuit court jurisprudence.',
    vector: [0.18, 0.41, 0.79],
    x: 22,
    y: 25
  },
  {
    id: 'v-9',
    category: 'Legal',
    text: 'Contract analysis tools parse indemnification clauses and liability limitations in master services agreements.',
    vector: [0.21, 0.38, 0.83],
    x: 28,
    y: 32
  }
];
