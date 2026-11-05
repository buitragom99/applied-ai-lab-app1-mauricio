# Application Architecture

## Executive Overview

The Sales Quarterly Revenue Analyzer is an executive financial decision-support application that enables leadership teams to upload sales order CSV datasets and immediately analyze revenue trends across global regions, distribution channels, product lines, and fiscal quarters. It automatically aggregates raw transactional records into interactive cross-tabulation matrices and comparative visual charts, computing quarter-over-quarter revenue variances, unit volume shifts, and discount behaviors. The system integrates with Google's Gemini AI to deliver verified, strictly bounded three-sentence executive variance narratives that identify the primary catalysts behind regional revenue swings without risk of numerical hallucination.

## File Catalog

| File | Purpose |
| :--- | :--- |
| `.env.example` | Defines the template for necessary server environment variables, including the Gemini API key and network port configuration. |
| `bun.lock` | Records dependency resolution lock data from previous alternative package installations. |
| `index.html` | Serves as the web application entry point, containing document metadata, OpenGraph social tags, and the root DOM element. |
| `metadata.json` | Stores AI Studio platform configuration, including application branding, access permissions, and server-side Gemini API capabilities. |
| `package.json` | Defines project metadata, npm dependency packages, TypeScript configurations, and development and production execution scripts. |
| `README.md` | Provides the introductory project summary and reference documentation for the application repository. |
| `server.ts` | Implements the Express backend server hosting the web application, proxying AI requests to Gemini 3.8 Flash, and providing a deterministic fallback engine. |
| `src/App.tsx` | Functions as the primary React dashboard container that coordinates dataset state, metric calculations, and view toggles across all user interface components. |
| `src/components/AiSummaryCard.tsx` | Renders the executive AI narrative card displaying synthesized variance explanations, metric citations, and underlying driver breakdowns. |
| `src/components/CsvUploader.tsx` | Delivers an interactive drag-and-drop file upload zone supporting custom CSV ingestion and one-click sample dataset restoration. |
| `src/components/Header.tsx` | Presents the executive dashboard banner with data status badges, file indicators, and quick action controls for loading or resetting data. |
| `src/components/RawDataDrawer.tsx` | Provides an expandable side drawer allowing business stakeholders to inspect, filter, and audit individual raw order records. |
| `src/components/RevenueChart.tsx` | Renders dynamic, responsive bar visualizations comparing revenue figures across quarters and regions with metric toggles. |
| `src/components/RevenueTable.tsx` | Displays a financial cross-tabulation table summarizing quarterly revenues, sales unit volumes, and average discount percentages by territory. |
| `src/index.css` | Imports Tailwind CSS directives and defines global typography, base color schemes, and dashboard styling rules. |
| `src/main.tsx` | Initializes the client-side application by mounting the root React component tree into the browser DOM. |
| `src/types.ts` | Declares TypeScript data types and interfaces for sales transactions, matrix cross-tabulations, regional summaries, and API payloads. |
| `src/utils/calculations.ts` | Executes deterministic financial analytics to calculate quarter-over-quarter dollar variances, percentage growth, volume deltas, and segment drivers. |
| `src/utils/csvParser.ts` | Parses uploaded CSV text files with resilient quotation handling, flexible header mapping, and numerical sanitization. |
| `src/utils/sampleData.ts` | Supplies a realistic enterprise sales dataset spanning four fiscal quarters across multiple regions, products, and channels for immediate evaluation. |
| `tsconfig.json` | Specifies TypeScript compilation settings, module resolution strategies, JSX transformations, and path aliases. |
| `vite.config.ts` | Configures Vite bundler plugins for React and Tailwind CSS, path aliases, and development server options. |
