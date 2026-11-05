import React, { useState, useMemo } from 'react';
import { AggregatedAnalytics } from '../types';
import { formatCurrency, formatNumber } from '../utils/analytics';
import { BarChart2, Layers, TrendingUp } from 'lucide-react';

interface ChartSectionProps {
  analytics: AggregatedAnalytics;
}

type GroupMode = 'quarter' | 'region' | 'stacked';

// Harmonious, distinct color palette for regions
const REGION_PALETTE = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#0284C7', // Sky
  '#E11D48', // Rose
  '#0D9488', // Teal
  '#475569', // Slate
];

const QUARTER_PALETTE = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
];

export const ChartSection: React.FC<ChartSectionProps> = ({ analytics }) => {
  const [groupMode, setGroupMode] = useState<GroupMode>('quarter');
  const [hoveredData, setHoveredData] = useState<{
    quarter: string;
    region: string;
    revenue: number;
    units: number;
    avgDiscount: number;
    pctOfTotal: number;
    x: number;
    y: number;
  } | null>(null);

  const [activeRegionFilter, setActiveRegionFilter] = useState<string | null>(null);

  const { quarters, regions, matrix, grandTotalRevenue, quarterTotals } = analytics;

  // Region color mapping
  const regionColors = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((r, idx) => {
      map[r] = REGION_PALETTE[idx % REGION_PALETTE.length];
    });
    return map;
  }, [regions]);

  const quarterColors = useMemo(() => {
    const map: Record<string, string> = {};
    quarters.forEach((q, idx) => {
      map[q] = QUARTER_PALETTE[idx % QUARTER_PALETTE.length];
    });
    return map;
  }, [quarters]);

  if (quarters.length === 0 || regions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
        Upload sales order data to generate the quarterly revenue chart.
      </div>
    );
  }

  // Calculate maximum value for chart scaling
  const maxBarValue = useMemo(() => {
    if (groupMode === 'stacked') {
      let maxStack = 0;
      quarters.forEach((q) => {
        const total = quarterTotals[q] || 0;
        if (total > maxStack) maxStack = total;
      });
      return maxStack * 1.15 || 100000;
    } else {
      let maxSingle = 0;
      regions.forEach((r) => {
        quarters.forEach((q) => {
          const val = matrix[r]?.[q]?.revenue || 0;
          if (val > maxSingle) maxSingle = val;
        });
      });
      return maxSingle * 1.2 || 100000;
    }
  }, [groupMode, quarters, regions, matrix, quarterTotals]);

  // SVG dimensions
  const svgWidth = 860;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 50, left: 80 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Y-axis ticks (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => pct * maxBarValue);

  return (
    <div id="chart-view" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>Quarterly Revenue by Region</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Aggregated Gross Sales Volume</span>
            <span aria-hidden="true">·</span>
            <span>Hover bars for detailed order metrics</span>
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setGroupMode('quarter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              groupMode === 'quarter'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Quarter
          </button>
          <button
            onClick={() => setGroupMode('region')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              groupMode === 'region'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Region
          </button>
          <button
            onClick={() => setGroupMode('stacked')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              groupMode === 'stacked'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stacked</span>
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[640px] select-none"
        >
          {/* Background Grid Lines & Y-axis Labels */}
          {yTicks.map((tick, i) => {
            const yPos = padding.top + chartHeight - (tick / maxBarValue) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={svgWidth - padding.right}
                  y2={yPos}
                  stroke="#E2E8F0"
                  strokeDasharray={i === 0 ? 'none' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-slate-400 tabular-nums"
                >
                  {formatCurrency(tick, true)}
                </text>
              </g>
            );
          })}

          {/* Render Bars based on Group Mode */}
          {groupMode === 'quarter' && (
            // X-Axis = Quarters, Grouped bars = Regions
            quarters.map((q, qIndex) => {
              const groupWidth = chartWidth / quarters.length;
              const groupX = padding.left + qIndex * groupWidth;
              const barPadding = 4;
              const usableGroupWidth = groupWidth * 0.82;
              const barWidth = Math.max(6, (usableGroupWidth - (regions.length - 1) * barPadding) / regions.length);
              const groupStartOffset = (groupWidth - (barWidth * regions.length + (regions.length - 1) * barPadding)) / 2;

              // Check if Q2 or Q3 for highlighting
              const isQ2OrQ3 = q.toUpperCase() === 'Q2' || q.toUpperCase() === 'Q3';

              return (
                <g key={q}>
                  {/* Subtle highlight band behind Q2 and Q3 */}
                  {isQ2OrQ3 && (
                    <rect
                      x={groupX + 4}
                      y={padding.top}
                      width={groupWidth - 8}
                      height={chartHeight}
                      fill="#F8FAFC"
                      rx="6"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Group Label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={svgHeight - padding.bottom + 24}
                    textAnchor="middle"
                    className={`text-xs font-semibold ${
                      isQ2OrQ3 ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                    }`}
                  >
                    {q}
                    {isQ2OrQ3 && ' ★'}
                  </text>

                  {/* Total on top of group */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top - 8}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-400 tabular-nums"
                  >
                    {formatCurrency(quarterTotals[q] || 0, true)}
                  </text>

                  {/* Individual Region Bars */}
                  {regions.map((r, rIndex) => {
                    const data = matrix[r]?.[q] || { revenue: 0, units: 0, avgDiscount: 0 };
                    const barHeight = Math.max(0, (data.revenue / maxBarValue) * chartHeight);
                    const barX = groupX + groupStartOffset + rIndex * (barWidth + barPadding);
                    const barY = padding.top + chartHeight - barHeight;

                    const isDimmed = activeRegionFilter && activeRegionFilter !== r;
                    const fillColor = regionColors[r];

                    return (
                      <g key={`${q}-${r}`}>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={fillColor}
                          rx="3"
                          opacity={isDimmed ? 0.25 : 0.9}
                          className="transition-all duration-150 cursor-pointer hover:opacity-100"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredData({
                              quarter: q,
                              region: r,
                              revenue: data.revenue,
                              units: data.units,
                              avgDiscount: data.avgDiscount,
                              pctOfTotal: quarterTotals[q] > 0 ? (data.revenue / quarterTotals[q]) * 100 : 0,
                              x: barX + barWidth / 2,
                              y: barY - 10,
                            });
                          }}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })
          )}

          {groupMode === 'region' && (
            // X-Axis = Regions, Grouped bars = Quarters
            regions.map((r, rIndex) => {
              const groupWidth = chartWidth / regions.length;
              const groupX = padding.left + rIndex * groupWidth;
              const barPadding = 4;
              const usableGroupWidth = groupWidth * 0.82;
              const barWidth = Math.max(6, (usableGroupWidth - (quarters.length - 1) * barPadding) / quarters.length);
              const groupStartOffset = (groupWidth - (barWidth * quarters.length + (quarters.length - 1) * barPadding)) / 2;

              return (
                <g key={r}>
                  {/* Group Label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={svgHeight - padding.bottom + 24}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-slate-700"
                  >
                    {r}
                  </text>

                  {/* Individual Quarter Bars */}
                  {quarters.map((q, qIndex) => {
                    const data = matrix[r]?.[q] || { revenue: 0, units: 0, avgDiscount: 0 };
                    const barHeight = Math.max(0, (data.revenue / maxBarValue) * chartHeight);
                    const barX = groupX + groupStartOffset + qIndex * (barWidth + barPadding);
                    const barY = padding.top + chartHeight - barHeight;
                    const fillColor = quarterColors[q] || '#6366F1';

                    return (
                      <g key={`${r}-${q}`}>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={fillColor}
                          rx="3"
                          opacity={0.9}
                          className="transition-all duration-150 cursor-pointer hover:opacity-100"
                          onMouseEnter={() => {
                            setHoveredData({
                              quarter: q,
                              region: r,
                              revenue: data.revenue,
                              units: data.units,
                              avgDiscount: data.avgDiscount,
                              pctOfTotal: quarterTotals[q] > 0 ? (data.revenue / quarterTotals[q]) * 100 : 0,
                              x: barX + barWidth / 2,
                              y: barY - 10,
                            });
                          }}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })
          )}

          {groupMode === 'stacked' && (
            // X-Axis = Quarters, Stacked segments = Regions
            quarters.map((q, qIndex) => {
              const groupWidth = chartWidth / quarters.length;
              const groupX = padding.left + qIndex * groupWidth;
              const barWidth = Math.min(60, groupWidth * 0.45);
              const barX = groupX + (groupWidth - barWidth) / 2;

              let runningHeight = 0;

              return (
                <g key={q}>
                  <text
                    x={groupX + groupWidth / 2}
                    y={svgHeight - padding.bottom + 24}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-slate-700"
                  >
                    {q}
                  </text>

                  {/* Stacked total on top */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={padding.top + chartHeight - (quarterTotals[q] / maxBarValue) * chartHeight - 8}
                    textAnchor="middle"
                    className="text-[11px] font-mono fill-slate-600 font-semibold tabular-nums"
                  >
                    {formatCurrency(quarterTotals[q] || 0, true)}
                  </text>

                  {regions.map((r) => {
                    const data = matrix[r]?.[q] || { revenue: 0, units: 0, avgDiscount: 0 };
                    const segHeight = Math.max(0, (data.revenue / maxBarValue) * chartHeight);
                    const segY = padding.top + chartHeight - runningHeight - segHeight;
                    runningHeight += segHeight;

                    const isDimmed = activeRegionFilter && activeRegionFilter !== r;

                    return (
                      <rect
                        key={`${q}-${r}`}
                        x={barX}
                        y={segY}
                        width={barWidth}
                        height={segHeight}
                        fill={regionColors[r]}
                        opacity={isDimmed ? 0.25 : 0.9}
                        className="transition-all duration-150 cursor-pointer hover:opacity-100"
                        onMouseEnter={() => {
                          setHoveredData({
                            quarter: q,
                            region: r,
                            revenue: data.revenue,
                            units: data.units,
                            avgDiscount: data.avgDiscount,
                            pctOfTotal: quarterTotals[q] > 0 ? (data.revenue / quarterTotals[q]) * 100 : 0,
                            x: barX + barWidth / 2,
                            y: segY,
                          });
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                      />
                    );
                  })}
                </g>
              );
            })
          )}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredData && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-lg border border-slate-700 whitespace-nowrap min-w-[180px]"
            style={{
              left: `${(hoveredData.x / svgWidth) * 100}%`,
              top: `${(hoveredData.y / svgHeight) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between font-semibold pb-1.5 border-b border-slate-800">
              <span>{hoveredData.region}</span>
              <span className="text-indigo-400 font-mono">{hoveredData.quarter}</span>
            </div>
            <div className="mt-1.5 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Revenue:</span>
                <span className="text-white font-semibold">
                  {formatCurrency(hoveredData.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quarter Share:</span>
                <span className="text-emerald-400">{hoveredData.pctOfTotal.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Units:</span>
                <span className="text-slate-200">{formatNumber(hoveredData.units)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Discount:</span>
                <span className="text-amber-400">{hoveredData.avgDiscount.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Interactive Filter Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Legend:</span>
          {groupMode === 'region' ? (
            <div className="flex items-center gap-3">
              {quarters.map((q) => (
                <div key={q} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0"
                    style={{ backgroundColor: quarterColors[q] || '#6366F1' }}
                  />
                  <span className="text-slate-700">{q}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {regions.map((r) => {
                const isActive = activeRegionFilter === r;
                return (
                  <button
                    key={r}
                    onClick={() => setActiveRegionFilter(isActive ? null : r)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      isActive ? 'bg-slate-200 font-semibold' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: regionColors[r] }}
                    />
                    <span className="text-slate-700">{r}</span>
                  </button>
                );
              })}
              {activeRegionFilter && (
                <button
                  onClick={() => setActiveRegionFilter(null)}
                  className="text-indigo-600 underline text-[11px] ml-2 cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-slate-400 text-[11px]">
          Total Volume: <span className="font-mono text-slate-700 font-semibold">{formatCurrency(grandTotalRevenue)}</span>
        </div>
      </div>
    </div>
  );
};
