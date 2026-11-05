"use client";

import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { cn } from "cn";
import { Trophy } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsResponse } from "@/lib/api/contract";
import { formatMetric } from "@/lib/format";

type ModelRow = MetricsResponse["models"][number];

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, ModelRow>();

function metricKeys(models: ModelRow[]): string[] {
  const keys: string[] = [];
  for (const m of models)
    for (const k of Object.keys(m.metrics)) if (!keys.includes(k)) keys.push(k);
  return keys;
}

export function MetricsTable({ models }: { models: ModelRow[] }) {
  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("name", {
          header: "Модель",
          cell: ({ row }) => (
            <span className="flex items-center gap-2">
              {row.original.is_best && (
                <Trophy className="size-4 text-warning" aria-label="Найкраща" />
              )}
              <span className={cn(row.original.is_best && "font-medium")}>{row.original.name}</span>
              {row.original.is_baseline && <Badge variant="outline">baseline</Badge>}
            </span>
          ),
        }),
        ...metricKeys(models).map((key) =>
          helper.display({
            id: key,
            header: key.replace("_", "-"),
            cell: ({ row }) => {
              const v = row.original.metrics[key];
              return v === undefined ? "—" : formatMetric(key, v);
            },
          }),
        ),
      ]),
    [models],
  );
  const table = useTable({ features, columns, data: models });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Порівняння моделей</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b">
                {group.headers.map((header, i) => (
                  <th
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap px-3 py-2 font-medium text-muted-foreground",
                      i === 0 ? "text-left" : "text-right",
                    )}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn("border-b last:border-0", row.original.is_best && "bg-primary/5")}
              >
                {row.getAllCells().map((cell, i) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "whitespace-nowrap px-3 py-2",
                      i === 0 ? "text-left" : "text-right tabular-nums",
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
