"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import type { ChartSpec } from "@/lib/api/contract";
import { formatNumber } from "@/lib/format";
import { ChartCard, ChartRenderer } from "./chart-renderer";

const STATS = [
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1" },
] as const;

/** Reads the stored precision/recall/F1-vs-threshold curve; no ML runs in the browser. */
export function ThresholdSlider({ spec }: { spec: ChartSpec }) {
  const [threshold, setThreshold] = useState(0.5);

  const valueAt = (name: string) => {
    const series = spec.series.find((s) => s.name.toLowerCase() === name);
    if (!series || series.points.length === 0) return undefined;
    const nearest = series.points.reduce((best, p) =>
      Math.abs(Number(p.x) - threshold) < Math.abs(Number(best.x) - threshold) ? p : best,
    );
    return nearest.y;
  };

  return (
    <ChartCard spec={spec} height={380}>
      <div className="flex h-full flex-col gap-4">
        <div className="min-h-0 flex-1">
          <ChartRenderer spec={spec} referenceX={threshold} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="w-24 shrink-0 text-sm">
              Поріг: <span className="font-medium tabular-nums">{threshold.toFixed(2)}</span>
            </span>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[threshold]}
              onValueChange={(v) => setThreshold(Array.isArray(v) ? (v[0] ?? 0.5) : v)}
              aria-label="Поріг класифікації"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {STATS.map(({ key, label }) => {
              const v = valueAt(key);
              return (
                <div key={key} className="rounded-lg bg-muted/60 px-2 py-1.5">
                  <div className="text-muted-foreground text-xs">{label}</div>
                  <div className="font-semibold tabular-nums">
                    {v === undefined ? "—" : formatNumber(v)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-muted-foreground text-xs">
            Нижчий поріг ловить більше фішингу, але більше хибних тривог.
          </p>
        </div>
      </div>
    </ChartCard>
  );
}
