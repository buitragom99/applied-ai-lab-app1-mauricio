# Architecture Overview

The Regional Quarterly Sales Intelligence platform enables commercial leaders and finance teams to transform raw sales order files into executive-ready revenue analytics and AI briefings. Users upload or paste sales records containing quarters, geographic regions, sales channels, product lines, unit counts, discounts, and revenue figures to instantly generate comparative performance charts and cross-quarter pivot tables. Built-in analytical models calculate exact quarter-over-quarter shifts and identify the region experiencing the greatest variance from Q2 to Q3, which an integrated Google Gemini language model summarizes into an audit-grounded, three-sentence narrative explaining the primary product, channel, and volume drivers behind the financial change.

## File Directory & Responsibilities

| File | Description |
| :--- | :--- |
| `ARCHITECTURE.md` | Explains the commercial purpose and technical directory structure of the application for business stakeholders. |
| `.env.example` | Documents the required environment variables, including the Gemini API key used by the backend analysis engine. |
| `.gitignore` | Prevents local cache directories, production build bundles, and sensitive local secrets from being checked into version control. |
| `index.html` | Serves as the web application entry page, setting executive page titles, metadata descriptions, and typographic web fonts. |
| `metadata.json` | Specifies application permissions and declares server-side artificial intelligence integration capabilities for AI Studio. |
| `package.json` | Defines project metadata, dependencies such as Express and Google GenAI, and executable development and build scripts. |
| `server.ts` | Runs the Express backend server, securely connects to Google Gemini via the GenAI SDK, and serves the frontend application. |
| `tsconfig.json` | Configures TypeScript compilation rules, path aliases, and language strictness settings for the codebase. |
| `vite.config.ts` | Configures the Vite development server, React compilation plugins, Tailwind styling extensions, and module resolution aliases. |
| `src/main.tsx` | Bootstraps the root React 19 application and mounts it onto the primary HTML document container. |
| `src/index.css` | Imports Tailwind CSS utility layers and establishes font hierarchies and dark-mode styling variables. |
| `src/App.tsx` | Assembles the complete dashboard layout, coordinating file uploads, KPI summary metrics, chart renderings, data tables, and AI briefings. |
| `src/types.ts` | Defines TypeScript data interfaces for raw sales records, aggregation matrix entries, driver breakdowns, and AI response structures. |
| `src/utils/csvParser.ts` | Parses uploaded CSV text, normalizes varied column names and currency symbols, and validates mandatory sales data fields. |
| `src/utils/analytics.ts` | Aggregates revenue, unit volume, and weighted discount figures across regions and calculates Q2-to-Q3 variance drivers. |
| `src/utils/sampleData.ts` | Supplies a realistic multi-quarter enterprise sales order dataset and provides a utility to download a CSV template. |
| `src/components/Header.tsx` | Displays the top navigation bar with brand identification, dataset record counts, and quick navigation actions. |
| `src/components/CsvUploader.tsx` | Provides an interactive drag-and-drop file upload zone, paste modal, header mapping indicators, and parsing error alerts. |
| `src/components/ChartSection.tsx` | Renders an interactive SVG revenue chart supporting grouped-quarter, grouped-region, and stacked visual comparative modes. |
| `src/components/TableSection.tsx` | Displays a multi-quarter revenue pivot matrix with sortable headers, search filters, Q2-to-Q3 delta indicators, and driver drill-downs. |
| `src/components/AiSummarySection.tsx` | Presents the Gemini-generated three-sentence executive variance narrative alongside sentence auditing, audio narration, and grounding data inspection. |
| `src/components/RawDataDrawer.tsx` | Opens a searchable and paginated modal drawer allowing analysts to inspect individual order records. |
