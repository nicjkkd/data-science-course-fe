"use client";

import { useQuery } from "@tanstack/react-query";
import { insightsQuery } from "@/lib/api/queries";
import type { ProjectMeta } from "@/lib/projects";
import { ChartGrid } from "./chart-grid";
import { QueryError, QueryLoading } from "./query-state";

export function DataTab({ project }: { project: ProjectMeta }) {
  const { data, isPending, isError, error, refetch } = useQuery(insightsQuery(project.slug));
  if (isPending) return <QueryLoading rows={2} />;
  if (isError) return <QueryError error={error} onRetry={() => refetch()} />;
  return <ChartGrid charts={data.charts} />;
}
