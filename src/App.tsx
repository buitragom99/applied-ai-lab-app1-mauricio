import React, { useState, useEffect, useMemo } from 'react';
import { SalesOrder } from './types';
import { parseSalesCsv } from './utils/csvParser';
import { computeAnalytics, formatCurrency, formatNumber } from './utils/analytics';
import { SAMPLE_SALES_CSV } from './utils/sampleData';
import { Header } from './components/Header';
import { CsvUploader } from './components/CsvUploader';
import { ChartSection } from './components/ChartSection';
import { TableSection } from './components/TableSection';
import { AiSummarySection } from './components/AiSummarySection';
import { RawDataDrawer } from './components/RawDataDrawer';
import {
  DollarSign,
  Package,
  Percent,
  Globe2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [currentFilename, setCurrentFilename] = useState<string>('sample_sales_orders.csv');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<Record<string, string>>({});
  const [isRawDataOpen, setIsRawDataOpen] = useState<boolean>(false);

  // Load sample dataset on initial load
  const loadSampleDataset = () => {
    const res = parseSalesCsv(SAMPLE_SALES_CSV);
    setOrders(res.orders);
    setCurrentFilename('enterprise_sales_orders_q1_q4.csv');
    setParseErrors(res.errors);
    setParseWarnings(res.warnings);
    setDetectedColumns(res.detectedColumns);
  };

  useEffect(() => {
    loadSampleDataset();
  }, []);

  const handleCsvLoaded = (csvText: string, filename: string = 'uploaded_data.csv') => {
    const res = parseSalesCsv(csvText);
    setParseErrors(res.errors);
    setParseWarnings(res.warnings);
    setDetectedColumns(res.detectedColumns);

    if (res.orders.length > 0) {
      setOrders(res.orders);
      setCurrentFilename(filename);
    }
  };

  const analytics = useMemo(() => {
    return computeAnalytics(orders);
  }, [orders]);

  const scrollToAiSummary = () => {
    const el = document.getElementById('ai-summary-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        orderCount={orders.length}
        onOpenRawData={() => setIsRawDataOpen(true)}
        onLoadSample={loadSampleDataset}
        onScrollToAi={scrollToAiSummary}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top KPI Ribbon */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {formatCurrency(analytics.grandTotalRevenue)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Across {analytics.quarters.length} quarters
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Total Units Delivered</span>
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {formatNumber(analytics.grandTotalUnits)}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {orders.length} individual order lines
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Avg Revenue-Weighted Discount</span>
                <Percent className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {analytics.overallAvgDiscount.toFixed(1)}%
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Contractual pricing concessions
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Active Coverage</span>
                <Globe2 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {analytics.regions.length} Regions
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {analytics.products.length} Products · {analytics.channels.length} Channels
              </div>
            </div>
          </div>
        )}

        {/* CSV Uploader Section */}
        <CsvUploader
          onDataLoaded={handleCsvLoaded}
          currentFilename={currentFilename}
          orderCount={orders.length}
          errors={parseErrors}
          warnings={parseWarnings}
          onLoadSample={loadSampleDataset}
          detectedColumns={detectedColumns}
        />

        {/* AI Regional Variance Executive Summary (Core Prompt Feature) */}
        <AiSummarySection analytics={analytics} />

        {/* Chart View: Total Revenue by Region and Quarter */}
        <ChartSection analytics={analytics} />

        {/* Table View: Total Revenue by Region and Quarter */}
        <TableSection analytics={analytics} />
      </main>

      {/* Raw Data Modal Drawer */}
      <RawDataDrawer
        isOpen={isRawDataOpen}
        onClose={() => setIsRawDataOpen(false)}
        orders={orders}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Regional Quarterly Revenue Intelligence Platform · Powered by Gemini 3.8 Flash
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRawDataOpen(true)}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Order Records ({orders.length})
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={loadSampleDataset}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset to Sample Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
