import React, { useState, useMemo } from 'react';
import { AggregatedAnalytics, RegionVarianceAnalysis } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import {
  Table as TableIcon,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Search,
} from 'lucide-react';

interface TableSectionProps {
  analytics: AggregatedAnalytics;
}

type SortField = 'region' | 'total' | 'diff' | 'pct' | string; // string can be quarter name

export const TableSection: React.FC<TableSectionProps> = ({ analytics }) => {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('diff');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default descending (largest variance first)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const {
    quarters,
    regions,
    matrix,
    regionTotals,
    quarterTotals,
    grandTotalRevenue,
    hasQ2AndQ3,
    regionVariances,
  } = analytics;

  // Map of variances for fast lookup
  const varianceMap = useMemo(() => {
    const map: Record<string, RegionVarianceAnalysis> = {};
    regionVariances.forEach((v) => {
      map[v.region] = v;
    });
    return map;
  }, [regionVariances]);

  // Filter and sort regions
  const sortedRegions = useMemo(() => {
    let list = regions.filter((r) =>
      r.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'region') {
        return sortAsc ? a.localeCompare(b) : b.localeCompare(a);
      } else if (sortField === 'total') {
        valA = regionTotals[a] || 0;
        valB = regionTotals[b] || 0;
      } else if (sortField === 'diff') {
        valA = Math.abs(varianceMap[a]?.revenueDiff || 0);
        valB = Math.abs(varianceMap[b]?.revenueDiff || 0);
      } else if (sortField === 'pct') {
        valA = Math.abs(varianceMap[a]?.pctChange || 0);
        valB = Math.abs(varianceMap[b]?.pctChange || 0);
      } else {
        // Quarter name
        valA = matrix[a]?.[sortField]?.revenue || 0;
        valB = matrix[b]?.[sortField]?.revenue || 0;
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [regions, searchQuery, sortField, sortAsc, regionTotals, varianceMap, matrix]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for new field
    }
  };

  const copyTableAsText = () => {
    let text = `Region\t${quarters.join('\t')}\tTotal Revenue\tQ2->Q3 Variance ($)\tQ2->Q3 Variance (%)\n`;
    sortedRegions.forEach((r) => {
      const qCols = quarters.map((q) => matrix[r]?.[q]?.revenue || 0).join('\t');
      const v = varianceMap[r];
      text += `${r}\t${qCols}\t${regionTotals[r] || 0}\t${v?.revenueDiff || 0}\t${(v?.pctChange || 0).toFixed(1)}%\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTableCsv = () => {
    let csv = `Region,${quarters.join(',')},Total Revenue,Q2 to Q3 Dollar Variance,Q2 to Q3 Percent Variance\n`;
    sortedRegions.forEach((r) => {
      const qCols = quarters.map((q) => matrix[r]?.[q]?.revenue || 0).join(',');
      const v = varianceMap[r];
      csv += `"${r}",${qCols},${regionTotals[r] || 0},${v?.revenueDiff || 0},${(v?.pctChange || 0).toFixed(2)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'regional_quarterly_revenue_summary.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (regions.length === 0) return null;

  // Calculate total Q2 and Q3 aggregate delta
  const totalQ2 = quarterTotals['Q2'] || 0;
  const totalQ3 = quarterTotals['Q3'] || 0;
  const totalQ2Q3Diff = totalQ3 - totalQ2;
  const totalQ2Q3Pct = totalQ2 > 0 ? (totalQ2Q3Diff / totalQ2) * 100 : 0;

  return (
    <div id="table-view" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {/* Table Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-indigo-600" />
            <span>Quarterly Revenue Matrix & Q2→Q3 Variance</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Click any row to drill down into product and channel drivers</span>
            <span aria-hidden="true">·</span>
            <span>All values in USD</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
            />
          </div>

          <button
            onClick={copyTableAsText}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Copy as tab-delimited table"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={downloadTableCsv}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Export table summary as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
              <th className="py-3 px-3 w-8"></th>
              <th
                onClick={() => toggleSort('region')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {quarters.map((q) => {
                const isQ2OrQ3 = q.toUpperCase() === 'Q2' || q.toUpperCase() === 'Q3';
                return (
                  <th
                    key={q}
                    onClick={() => toggleSort(q)}
                    className={`py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors ${
                      isQ2OrQ3 ? 'bg-indigo-50/50 text-indigo-900 font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{q}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                );
              })}

              <th
                onClick={() => toggleSort('total')}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Revenue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {hasQ2AndQ3 && (
                <>
                  <th
                    onClick={() => toggleSort('diff')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors bg-slate-100/60"
                  >
                    <div className="flex items-center justify-end gap-1 text-slate-800">
                      <span>Q2 → Q3 Δ ($)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('pct')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 transition-colors bg-slate-100/60"
                  >
                    <div className="flex items-center justify-end gap-1 text-slate-800">
                      <span>Q2 → Q3 Δ (%)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {sortedRegions.map((r) => {
              const isExpanded = expandedRegion === r;
              const v = varianceMap[r];
              const isPos = (v?.revenueDiff || 0) >= 0;

              return (
                <React.Fragment key={r}>
                  <tr
                    onClick={() => setExpandedRegion(isExpanded ? null : r)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isExpanded ? 'bg-slate-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-slate-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-700" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900">
                      {r}
                    </td>

                    {quarters.map((q) => {
                      const data = matrix[r]?.[q] || { revenue: 0, units: 0, avgDiscount: 0 };
                      const isQ2OrQ3 = q.toUpperCase() === 'Q2' || q.toUpperCase() === 'Q3';
                      return (
                        <td
                          key={q}
                          className={`py-3 px-3 text-right ${
                            isQ2OrQ3 ? 'bg-indigo-50/20 text-slate-900' : 'text-slate-700'
                          }`}
                        >
                          {formatCurrency(data.revenue)}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatCurrency(regionTotals[r] || 0)}
                    </td>

                    {hasQ2AndQ3 && (
                      <>
                        <td
                          className={`py-3 px-3 text-right font-semibold bg-slate-50/60 ${
                            isPos ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {isPos ? (
                              <TrendingUp className="w-3 h-3 shrink-0" />
                            ) : (
                              <TrendingDown className="w-3 h-3 shrink-0" />
                            )}
                            <span>{v ? `${isPos ? '+' : ''}${formatCurrency(v.revenueDiff)}` : '-'}</span>
                          </div>
                        </td>

                        <td
                          className={`py-3 px-3 text-right font-semibold bg-slate-50/60 ${
                            isPos ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {v ? formatPercent(v.pctChange) : '-'}
                        </td>
                      </>
                    )}
                  </tr>

                  {/* Expanded Drilldown */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <td colSpan={quarters.length + (hasQ2AndQ3 ? 4 : 2)} className="py-4 px-6 font-sans">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Product Shift in this Region */}
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                              <span>Top Product Drivers (Q2 vs Q3)</span>
                              <span className="text-[10px] text-slate-500">Variance</span>
                            </div>
                            <div className="mt-2.5 space-y-2 text-xs">
                              {v?.topProductDrivers.map((p) => {
                                const pPos = p.diff >= 0;
                                return (
                                  <div key={p.product} className="flex items-center justify-between">
                                    <span className="text-slate-700 truncate pr-2 max-w-[150px]">
                                      {p.product}
                                    </span>
                                    <div className="text-right font-mono tabular-nums">
                                      <span
                                        className={`font-semibold ${
                                          pPos ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {pPos ? '+' : ''}
                                        {formatCurrency(p.diff, true)}
                                      </span>
                                      <span className="text-slate-400 text-[10px] ml-1.5">
                                        ({formatPercent(p.pctChange)})
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Channel Shift in this Region */}
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
                              <span>Channel Shift (Q2 vs Q3)</span>
                              <span className="text-[10px] text-slate-500">Net Volume</span>
                            </div>
                            <div className="mt-2.5 space-y-2 text-xs">
                              {v?.topChannelDrivers.map((c) => {
                                const cPos = c.diff >= 0;
                                return (
                                  <div key={c.channel} className="flex items-center justify-between">
                                    <span className="text-slate-700 truncate pr-2 max-w-[150px]">
                                      {c.channel}
                                    </span>
                                    <div className="text-right font-mono tabular-nums">
                                      <span
                                        className={`font-semibold ${
                                          cPos ? 'text-emerald-700' : 'text-rose-700'
                                        }`}
                                      >
                                        {cPos ? '+' : ''}
                                        {formatCurrency(c.diff, true)}
                                      </span>
                                      <span className="text-slate-400 text-[10px] ml-1.5">
                                        ({formatPercent(c.pctChange)})
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Operational Summary */}
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">
                              Operational Key Metrics
                            </div>
                            <div className="mt-2.5 space-y-2 text-xs font-mono tabular-nums">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Q2 Units Sold:</span>
                                <span className="font-semibold text-slate-800">
                                  {formatNumber(v?.q2Units || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Q3 Units Sold:</span>
                                <span className="font-semibold text-slate-800">
                                  {formatNumber(v?.q3Units || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Q2 Avg Discount:</span>
                                <span className="text-slate-800">
                                  {(v?.q2AvgDiscount || 0).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Q3 Avg Discount:</span>
                                <span className="text-slate-800">
                                  {(v?.q3AvgDiscount || 0).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100/90 font-mono font-bold text-slate-900 tabular-nums">
              <td className="py-3 px-3"></td>
              <td className="py-3 px-3 font-sans font-bold">Total (All Regions)</td>
              {quarters.map((q) => (
                <td key={q} className="py-3 px-3 text-right">
                  {formatCurrency(quarterTotals[q] || 0)}
                </td>
              ))}
              <td className="py-3 px-3 text-right text-indigo-900">
                {formatCurrency(grandTotalRevenue)}
              </td>
              {hasQ2AndQ3 && (
                <>
                  <td
                    className={`py-3 px-3 text-right ${
                      totalQ2Q3Diff >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {totalQ2Q3Diff >= 0 ? '+' : ''}
                    {formatCurrency(totalQ2Q3Diff)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right ${
                      totalQ2Q3Diff >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {formatPercent(totalQ2Q3Pct)}
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
