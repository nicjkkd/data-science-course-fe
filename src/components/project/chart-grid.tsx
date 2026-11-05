"use client";

import { cn } from "cn";
import type { ReactNode } from "react";
import type { ChartSpec } from "@/lib/api/contract";
import { ChartCard, ChartRenderer } from "./chart-renderer";

/** Two-column grid of charts; heatmaps span both columns. `render` overrides a chart by spec. */
export function ChartGrid({
  charts,
  render,
}: {
  charts: ChartSpec[];
  render?: (spec: ChartSpec) => ReactNode | undefined;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((spec) => {
        const custom = render?.(spec);
        const wide = spec.kind === "heatmap";
        if (custom) {
          return (
            <div key={spec.id} className={cn(wide && "md:col-span-2")}>
              {custom}
            </div>
          );
        }
        return (
          <ChartCard key={spec.id} spec={spec} className={cn("min-w-0", wide && "md:col-span-2")}>
            <ChartRenderer spec={spec} />
          </ChartCard>
        );
      })}
    </div>
  );
}
