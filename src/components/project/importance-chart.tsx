"use client";

import type { ChartSpec, MetricsResponse } from "@/lib/api/contract";
import { ChartCard, ChartRenderer } from "./chart-renderer";

export function ImportanceChart({ importances }: { importances: MetricsResponse["importances"] }) {
  const top = [...importances].sort((a, b) => b.value - a.value).slice(0, 15);
  const spec: ChartSpec = {
    id: "importances",
    title: "Важливість ознак",
    description: "Найкраща модель, топ-15 ознак",
    kind: "bar",
    series: [{ name: "Важливість", points: top.map((i) => ({ x: i.label, y: i.value })) }],
  };
  return (
    <ChartCard spec={spec} height={Math.max(top.length * 28, 160)}>
      <ChartRenderer spec={spec} horizontal />
    </ChartCard>
  );
}
