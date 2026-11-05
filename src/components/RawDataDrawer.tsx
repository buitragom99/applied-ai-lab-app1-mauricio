import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../types';
import { formatCurrency, formatNumber } from '../utils/analytics';
import { X, Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface RawDataDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SalesOrder[];
}

export const RawDataDrawer: React.FC<RawDataDrawerProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [search, setSearch] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const quarters = useMemo(() => Array.from(new Set(orders.map((o) => o.quarter))).sort(), [orders]);
  const regions = useMemo(() => Array.from(new Set(orders.map((o) => o.region))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (selectedQuarter !== 'all' && o.quarter !== selectedQuarter) return false;
      if (selectedRegion !== 'all' && o.region !== selectedRegion) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          o.product.toLowerCase().includes(query) ||
          o.channel.toLowerCase().includes(query) ||
          o.region.toLowerCase().includes(query) ||
          o.quarter.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [orders, selectedQuarter, selectedRegion, search]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const pagedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const exportFilteredCsv = () => {
    let csv = 'quarter,region,channel,product,units,discount_pct,revenue\n';
    filteredOrders.forEach((o) => {
      csv += `"${o.quarter}","${o.region}","${o.channel}","${o.product}",${o.units},${o.discount_pct},${o.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_orders_filtered.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Raw Sales Orders Explorer ({filteredOrders.length} records)
            </h3>
            <p className="text-xs text-slate-500">
              Validated entries parsed from your uploaded CSV dataset
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportFilteredCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, channel..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Quarter:</span>
              <select
                value={selectedQuarter}
                onChange={(e) => {
                  setSelectedQuarter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Quarters</option>
                {quarters.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[11px] tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length}
          </div>
        </div>

        {/* Table Viewport */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white border-b border-slate-200 text-slate-600 font-semibold shadow-2xs">
              <tr>
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Quarter</th>
                <th className="py-2.5 px-4">Region</th>
                <th className="py-2.5 px-4">Channel</th>
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4 text-right">Units</th>
                <th className="py-2.5 px-4 text-right">Discount</th>
                <th className="py-2.5 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {pagedOrders.map((o, idx) => (
                <tr key={o.id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-4 text-slate-400">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-2 px-4 font-sans font-semibold text-indigo-700">
                    {o.quarter}
                  </td>
                  <td className="py-2 px-4 font-sans text-slate-800">{o.region}</td>
                  <td className="py-2 px-4 font-sans text-slate-600">{o.channel}</td>
                  <td className="py-2 px-4 font-sans text-slate-900 font-medium">{o.product}</td>
                  <td className="py-2 px-4 text-right text-slate-700">
                    {formatNumber(o.units)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-700">
                    {o.discount_pct.toFixed(1)}%
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(o.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="font-mono text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
