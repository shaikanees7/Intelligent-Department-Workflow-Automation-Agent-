import React from 'react';
import { PieChart, MoreHorizontal, TrendingUp } from 'lucide-react';

/**
 * StatsPieChartCard
 * Renders an institutional multi-slice Donut / Pie Chart with clean legend,
 * percentage breakdown, and optional waveform histogram bars matching the IDWAA theme.
 */
const StatsPieChartCard = ({
  title = 'Status Distribution Ratio',
  subtitle,
  badge,
  total,
  totalLabel = 'Total',
  items = [],
  showWaveform = true,
  className = ''
}) => {
  // Calculate total if not explicitly provided
  const computedTotal =
    typeof total === 'number'
      ? total
      : items.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  const displayTotal = computedTotal > 0 ? computedTotal : 0;

  // SVG Donut calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  let accumulatedOffset = 0;

  // Total bars for histogram waveform (if enabled)
  const totalBars = 32;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 transition-all duration-200 hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <PieChart className="w-4 h-4" />
            </span>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
              {title}
            </h4>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800 border border-teal-200/80">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <button
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition"
          title="Chart Options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Optional Waveform Histogram on Top */}
      {showWaveform && displayTotal > 0 && (
        <div className="space-y-2">
          {/* Top counts row */}
          <div className="flex justify-between text-xs font-bold px-1">
            {items.slice(0, 3).map((item, idx) => (
              <span key={idx} style={{ color: item.color }}>
                {item.label}: {item.count}
              </span>
            ))}
          </div>

          {/* Histogram bar sequence */}
          <div className="bg-[#FAFBFB] p-2 rounded-xl border border-slate-100 flex items-end justify-between gap-1 h-11">
            {Array.from({ length: totalBars }).map((_, i) => {
              // Determine slice bucket for this bar
              let barColor = items[0]?.color || '#5E9CA0';
              let acc = 0;
              for (const item of items) {
                const share = (item.count / (displayTotal || 1)) * totalBars;
                if (i < acc + share) {
                  barColor = item.color;
                  break;
                }
                acc += share;
              }

              const heights = [
                35, 50, 70, 45, 80, 60, 75, 90, 50, 70, 55, 75, 85, 65, 50, 60,
                80, 65, 75, 90, 45, 55, 70, 85, 60, 75, 95, 50, 65, 45, 40, 35
              ];
              const heightPercent = heights[i % heights.length];

              return (
                <div
                  key={i}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor
                  }}
                  className="w-full rounded-sm transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Main Chart Section: Donut + Detailed Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
        {/* SVG Circular Donut Chart */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 120 120"
          >
            {/* Background Base Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="14"
            />

            {/* Render Donut Slices */}
            {displayTotal > 0 ? (
              items.map((item, idx) => {
                const count = Number(item.count) || 0;
                if (count <= 0) return null;
                const fraction = count / displayTotal;
                const strokeLength = fraction * circumference;
                const currentOffset = accumulatedOffset;
                accumulatedOffset += strokeLength;

                return (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="14"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap={items.length === 1 ? 'round' : 'butt'}
                    className="transition-all duration-700 ease-out hover:stroke-[16] cursor-pointer"
                  >
                    <title>
                      {item.label}: {count} ({Math.round(fraction * 100)}%)
                    </title>
                  </circle>
                );
              })
            ) : (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="14"
              />
            )}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
              {displayTotal}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {totalLabel}
            </span>
          </div>
        </div>

        {/* Breakdown Legend with Percentages & Bars */}
        <div className="flex-1 w-full space-y-2.5">
          {items.map((item, idx) => {
            const count = Number(item.count) || 0;
            const percentage =
              displayTotal > 0 ? Math.round((count / displayTotal) * 100) : 0;

            return (
              <div key={idx} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 transition">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-slate-900">{count}</span>
                    <span className="text-slate-400 text-[11px] font-normal w-9 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPieChartCard;

