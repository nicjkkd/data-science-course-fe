"use client";

import { useQuery } from "@tanstack/react-query";
import { Car, Link2, Siren } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { metricsQuery } from "@/lib/api/queries";
import { formatMetric } from "@/lib/format";
import type { ProjectMeta, ProjectSlug } from "@/lib/projects";

const ICONS: Record<ProjectSlug, typeof Car> = {
  "car-price": Car,
  phishing: Link2,
  "air-alerts": Siren,
};

export function ProjectCard({ project }: { project: ProjectMeta }) {
  const { data, isPending, isError } = useQuery(metricsQuery(project.slug));
  const Icon = ICONS[project.slug];
  const best = data?.models.find((m) => m.is_best);
  const value = best?.metrics[project.headlineMetric];

  return (
    <Link
      href={`/${project.slug}`}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-colors group-hover:bg-muted/40">
        <CardHeader>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Icon className="size-5" />
            </span>
            <Badge variant="secondary">{project.taskLabel}</Badge>
          </div>
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <CardDescription>{project.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-muted-foreground">
              {project.headlineMetric.replace("_", "-")}
            </span>
            {isPending ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <span className="font-semibold text-xl tabular-nums">
                {isError || value === undefined ? "—" : formatMetric(project.headlineMetric, value)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
