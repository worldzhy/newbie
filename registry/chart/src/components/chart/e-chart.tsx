"use client";

import { useEffect, useRef } from "react";
import { echarts } from "./echarts";
import type { EChartsCoreOption } from "./echarts";

interface EChartProps {
  option: EChartsCoreOption;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Thin React adapter around an echarts instance: init, setOption, resize via
 * ResizeObserver and dispose on unmount. Self-owned instead of a third-party
 * wrapper so it stays compatible with both React 18 and 19. The outer div
 * carries caller sizing (className/style); the inner div fills it, which is
 * the element echarts measures.
 */
export function EChart({ option, className, style }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<ReturnType<typeof echarts.init> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const instance = echarts.init(container);
    instanceRef.current = instance;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      instance.dispose();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div className={className} style={style}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
