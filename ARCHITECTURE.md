# Applied AI Lab 1 — System Architecture

Applied AI Lab App 1 is an enterprise-grade artificial intelligence experimentation and evaluation workbench that enables teams and practitioners to prototype, benchmark, and optimize generative AI systems. The application provides an interactive suite of tools to design precision prompt templates, test model hyperparameters like temperature and nucleus sampling, conduct side-by-side A/B evaluation matrices with automated hallucination safety scoring, visualize dense semantic vector embeddings in real time, simulate end-to-end Retrieval Augmented Generation (RAG) pipelines, and export audit-ready laboratory reports for business stakeholders.

## File Catalog

| File | Description |
| --- | --- |
| `README.md` | Contains introductory project branding and template links for AI Studio applications. |
| `package.json` | Configures project metadata, dependencies, and build scripts for the Node.js runtime and Vite dev server. |
| `metadata.json` | Registers the application name, capabilities, and system permissions for AI Studio. |
| `index.html` | Serves as the web entry point, configuring responsive viewport meta tags, social sharing cards, and the React root element. |
| `vite.config.ts` | Configures Vite build tooling with React and Tailwind CSS plugins to serve the app on host 0.0.0.0 and port 3000. |
| `tsconfig.json` | Defines TypeScript compiler settings for frontend application code to enforce type safety and modern JavaScript output. |
| `tsconfig.node.json` | Specifies TypeScript compilation options tailored for Node.js build configuration files. |
| `eslint.config.js` | Configures ESLint code analysis rules to ensure code consistency and prevent common runtime errors. |
| `.env.example` | Provides environment variable templates for configuring server-side generative AI integration keys. |
| `src/index.css` | Imports Tailwind CSS v4 directives and establishes global dark-theme styling across the interface. |
| `src/types.ts` | Declares TypeScript interfaces and types for models, prompts, experiments, embeddings, and RAG pipeline telemetry. |
| `src/data/labPresets.ts` | Supplies benchmark prompts, system instructions, and vector dataset clusters for applied AI testing. |
| `src/components/Navigation.tsx` | Renders the primary header with lab module tabs, system status indicators, and report export triggers. |
| `src/components/PromptPlayground.tsx` | Provides an interactive workbench to adjust inference hyperparameters and test prompt templates with live latency metrics. |
| `src/components/ExperimentMatrix.tsx` | Compares multiple prompt variants side-by-side with automated scoring for relevance, accuracy, and hallucination risk. |
| `src/components/VectorEmbeddingsDemo.tsx` | Demonstrates semantic similarity through an interactive 2D projection scatter plot and real-time cosine distance calculations. |
| `src/components/RAGPipelineSimulator.tsx` | Visualizes the five sequential phases of Retrieval Augmented Generation from query ingestion to grounded response synthesis. |
| `src/components/LabReportModal.tsx` | Generates and exports downloadable Markdown laboratory reports summarizing experiment benchmarks and findings. |
| `src/App.tsx` | Coordinates top-level application state, experiment persistence, and tab routing across the workspace. |
| `src/main.tsx` | Bootstraps and mounts the React application into the browser DOM. |
| `ARCHITECTURE.md` | Documents the business purpose of the application and catalogs every file in the codebase. |
