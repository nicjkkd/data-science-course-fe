"use client";

import { useQuery } from "@tanstack/react-query";
import { metricsQuery } from "@/lib/api/queries";
import type { ProjectMeta } from "@/lib/projects";
import { ChartGrid } from "./chart-grid";
import { ImportanceChart } from "./importance-chart";
import { MetricsTable } from "./metrics-table";
import { QueryError, QueryLoading } from "./query-state";
import { ThresholdSlider } from "./threshold-slider";

export function ModelTab({ project }: { project: ProjectMeta }) {
  const { data, isPending, isError, error, refetch } = useQuery(metricsQuery(project.slug));
  if (isPending) return <QueryLoading rows={3} />;
  if (isError) return <QueryError error={error} onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4">
      <MetricsTable models={data.models} />
      {data.importances.length > 0 && <ImportanceChart importances={data.importances} />}
      <ChartGrid
        charts={data.charts}
        render={(spec) =>
          data.task === "classification" && spec.id === "threshold_curve" ? (
            <ThresholdSlider spec={spec} />
          ) : undefined
        }
      />
    </div>
  );
}
