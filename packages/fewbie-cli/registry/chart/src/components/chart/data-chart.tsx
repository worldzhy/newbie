"use client";

import type { EChartsCoreOption } from "./echarts";
import { EChart } from "./e-chart";
import { CHART_PALETTE, paletteColor, withAlpha } from "./chart-palette";

export type DataChartType = "line" | "bar" | "pie" | "doughnut";

export interface DataChartDataset {
  label: string;
  data: (number | null)[];
  // Explicit color override; defaults to the cyclic palette by dataset index.
  color?: string;
  // Line only: render an area fill under the line.
  fill?: boolean;
  // Line/bar: stack group identifier; datasets sharing one stack up.
  stack?: string;
  // Line only: connect across null points (chart.js spanGaps equivalent).
  connectNulls?: boolean;
}

interface DataChartProps {
  chartType: DataChartType;
  labels: string[];
  datasets: DataChartDataset[];
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
  className?: string;
  style?: React.CSSProperties;
  // Merged into the built option; component keys (xAxis/yAxis/tooltip/...)
  // merge one level deep, everything else replaces.
  optionOverrides?: EChartsCoreOption;
  // Merged into every series entry (e.g. { barMaxWidth: 50 }).
  seriesOverrides?: Record<string, unknown>;
}

const darkTooltip = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  borderWidth: 0,
  textStyle: { color: "#fff", fontSize: 12 },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeOption(base: EChartsCoreOption, overrides?: EChartsCoreOption): EChartsCoreOption {
  if (!overrides) return base;
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const baseValue = merged[key];
    merged[key] = isPlainObject(baseValue) && isPlainObject(value) ? { ...baseValue, ...value } : value;
  }
  return merged;
}

function buildOption({
  chartType,
  labels,
  datasets,
  title,
  xAxisName,
  yAxisName,
  seriesOverrides,
}: Omit<DataChartProps, "className" | "style" | "optionOverrides">): EChartsCoreOption {
  const isCartesian = chartType === "line" || chartType === "bar";
  const colorAt = (dataset: DataChartDataset, index: number) => dataset.color ?? paletteColor(index);

  const series: Record<string, unknown>[] = isCartesian
    ? datasets.map((dataset, index) => {
        const color = colorAt(dataset, index);
        const base: Record<string, unknown> = {
          name: dataset.label,
          type: chartType,
          data: dataset.data,
          stack: dataset.stack,
          itemStyle: { color },
        };
        if (chartType === "line") {
          Object.assign(base, {
            showSymbol: false,
            smooth: 0.3,
            connectNulls: dataset.connectNulls ?? false,
            lineStyle: { width: 2, color },
            areaStyle: dataset.fill ? { color: withAlpha(color, 0.1) } : undefined,
          });
        }
        return { ...base, ...seriesOverrides };
      })
    : datasets.map((dataset, index) => {
        // Pie/doughnut: labels are slice names; multiple datasets render as
        // concentric rings (chart.js behaviour). Slice colors come from the
        // top-level palette by slice index.
        const ringStart = chartType === "doughnut" ? 40 : 0;
        const ringEnd = 72;
        const span = (ringEnd - ringStart) / datasets.length;
        const inner = ringStart + index * span;
        const outer = index === datasets.length - 1 ? ringEnd : inner + span - 3;
        return {
          name: dataset.label,
          type: "pie",
          radius: [`${inner}%`, `${outer}%`],
          data: labels.map((name, labelIndex) => ({ name, value: dataset.data[labelIndex] ?? 0 })),
          label: { show: false },
          ...seriesOverrides,
        };
      });

  return {
    color: [...CHART_PALETTE],
    title: title ? { text: title, left: "center", top: 0, textStyle: { fontSize: 14, fontWeight: 600 } } : undefined,
    legend: {
      top: title ? 28 : 0,
      icon: "circle",
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 11 },
    },
    tooltip: { trigger: isCartesian ? "axis" : "item", ...darkTooltip },
    grid: isCartesian ? { top: title ? 64 : 40, left: 8, right: 16, bottom: 4, containLabel: true } : undefined,
    xAxis: isCartesian
      ? {
          type: "category",
          data: labels,
          name: xAxisName,
          nameLocation: "middle",
          nameGap: 28,
          axisLabel: { interval: "auto", hideOverlap: true, fontSize: 10 },
        }
      : undefined,
    yAxis: isCartesian
      ? {
          type: "value",
          name: yAxisName,
          // chart.js beginAtZero: pin the baseline at 0 without clipping
          // negative values if they ever occur.
          min: (extent: { min: number; max: number }) => Math.min(0, extent.min),
          axisLabel: { fontSize: 10 },
          splitLine: { lineStyle: { color: "rgba(0, 0, 0, 0.06)" } },
        }
      : undefined,
    series: series as EChartsCoreOption["series"],
  };
}

/**
 * Structured-data chart: accepts the chart.js-shaped {labels, datasets}
 * contract (the same shape the analysis SSE stream emits) and renders it
 * through echarts with the app palette applied by dataset index.
 */
export function DataChart(props: DataChartProps) {
  const { className, style, optionOverrides, ...rest } = props;
  const option = mergeOption(buildOption(rest), optionOverrides);
  return <EChart option={option} className={className} style={style} />;
}
