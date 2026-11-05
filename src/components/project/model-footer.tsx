"use client";

import { useQuery } from "@tanstack/react-query";
import { metricsQuery } from "@/lib/api/queries";
import { formatDate, formatInt } from "@/lib/format";
import type { ProjectMeta } from "@/lib/projects";

export function ModelFooter({ project }: { project: ProjectMeta }) {
  const { data } = useQuery(metricsQuery(project.slug));
  if (!data) return null;
  const best = data.models.find((m) => m.is_best);
  return (
    <footer className="border-t pt-4 text-muted-foreground text-xs">
      Модель навчена {formatDate(data.trained_at)} · {formatInt(data.n_train)} /{" "}
      {formatInt(data.n_test)} записів{best ? ` · ${best.name}` : ""}
    </footer>
  );
}
