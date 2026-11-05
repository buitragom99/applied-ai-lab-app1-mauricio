import React, { useRef, useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { downloadSampleCsvFile } from '../utils/sampleData';

interface CsvUploaderProps {
  onDataLoaded: (csvText: string, filename?: string) => void;
  currentFilename?: string;
  orderCount: number;
  errors: string[];
  warnings: string[];
  onLoadSample: () => void;
  detectedColumns: Record<string, string>;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onDataLoaded,
  currentFilename,
  orderCount,
  errors,
  warnings,
  onLoadSample,
  detectedColumns,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onDataLoaded(content, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onDataLoaded(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    onDataLoaded(pastedText, 'pasted_data.csv');
    setShowPasteModal(false);
    setPastedText('');
  };

  const requiredCols = [
    { key: 'quarter', label: 'quarter' },
    { key: 'region', label: 'region' },
    { key: 'channel', label: 'channel' },
    { key: 'product', label: 'product' },
    { key: 'units', label: 'units' },
    { key: 'discount_pct', label: 'discount_pct' },
    { key: 'revenue', label: 'revenue' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            Sales Order Dataset
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Requires 7 columns: quarter, region, channel, product, units, discount_pct, revenue</span>
            <span aria-hidden="true">·</span>
            <span>CSV or comma-delimited text</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsvFile}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download reference CSV template with standard headers"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Template</span>
          </button>
          <button
            onClick={onLoadSample}
            className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Paste Text</span>
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-5 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center mb-3 text-slate-600">
            <Upload className="w-6 h-6 text-slate-700" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload your CSV or drag and drop file here
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports custom column casings, currency symbols, and percentage signs
          </p>
        </div>
      </div>

      {/* Dataset Status Banner */}
      {orderCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Loaded: {currentFilename || 'sales_orders.csv'}</span>
            </div>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{orderCount} validated orders</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400">Mapped Headers:</span>
            {requiredCols.map(({ key, label }) => {
              const matched = detectedColumns[key];
              return (
                <span
                  key={key}
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    matched ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-600'
                  }`}
                  title={matched ? `Mapped to "${matched}"` : 'Missing'}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Errors or Warnings */}
      {errors.length > 0 && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-800">Upload Parsing Error</div>
            {errors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{warnings.length} row warning(s):</span>{' '}
            <span>{warnings[0]}</span>
            {warnings.length > 1 && <span> (+{warnings.length - 1} more)</span>}
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Paste CSV Content</h3>
              <button
                onClick={() => setShowPasteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Paste comma-separated rows including headers: quarter, region, channel, product, units, discount_pct, revenue
            </p>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={8}
              placeholder="quarter,region,channel,product,units,discount_pct,revenue&#10;Q1,North America,Direct,Cloud Suite,100,5.0,500000..."
              className="mt-3 w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Process Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
