// Single source of truth for chart colors. Canvas-based chart engines cannot
// consume CSS variables, so the cyclic palette stays aligned with the app
// accent scale by hand.

export const CHART_PALETTE = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#6b7280"] as const;

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Semantic color exceptions: fixed colors carrying domain meaning, exempt
// from the cyclic palette.
export const SEVERITY_COLORS = {
  unknown: "#9ca3af",
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
} as const;

// Map heat gradient ordered low -> high for visualMap inRange.
export const MAP_GRADIENT_COLORS = ["#f5f3fd", "#cbc4f5", "#9a8df1", "#5d47f1", "#3013ec"] as const;
