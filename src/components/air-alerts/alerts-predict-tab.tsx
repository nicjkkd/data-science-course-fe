"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { QueryError } from "@/components/project/query-state";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { insightsQuery, predictAlerts } from "@/lib/api/queries";
import { REGIONS, regionSlugFromLabel } from "@/lib/regions";
import { HourSlider } from "./hour-slider";
import { RegionPanel } from "./region-panel";
import { UkraineMap } from "./ukraine-map";

const KYIV = "Europe/Kyiv";
const DEBOUNCE_MS = 300;

/** Current date (YYYY-MM-DD) and hour in Kyiv, whatever the browser's time zone. */
function kyivNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

/** Kyiv's UTC offset on a given date: «+02:00» in winter, «+03:00» in summer. */
function kyivOffset(date: string) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: KYIV, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "+02:00";
}

export function AlertsPredictTab() {
  const [params, setParams] = useQueryStates({
    region: parseAsString,
    hour: parseAsInteger,
    date: parseAsString,
  });
  // "now" is read after mount so the prerendered HTML doesn't bake in the build time
  const [now, setNow] = useState<{ date: string; hour: number } | null>(null);
  useEffect(() => setNow(kyivNow()), []);

  const region = params.region && params.region in REGIONS ? params.region : null;
  const hour = params.hour ?? now?.hour ?? 12;
  const date = params.date ?? now?.date ?? "";

  const insights = useQuery(insightsQuery("air-alerts"));
  const values = useMemo(() => {
    const heatmap = insights.data?.charts.find((c) => c.id === "region_hour_heatmap");
    const hh = `${String(hour).padStart(2, "0")}:00`;
    const out: Record<string, number> = {};
    for (const c of heatmap?.cells ?? []) {
      const slug = regionSlugFromLabel(c.y);
      if (slug && c.x === hh) out[slug] = c.v;
    }
    return out;
  }, [insights.data, hour]);

  const abortRef = useRef<AbortController | null>(null);
  const predict = useMutation({
    mutationFn: (body: { region: string; start: string }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return predictAlerts(body, controller.signal);
    },
  });
  const { mutate } = predict;
  const start = date ? `${date}T${String(hour).padStart(2, "0")}:00:00${kyivOffset(date)}` : null;

  useEffect(() => {
    if (!region || !start) return;
    const t = setTimeout(() => mutate({ region, start }), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [region, start, mutate]);

  const aborted = predict.error instanceof DOMException && predict.error.name === "AbortError";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="min-w-0">
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="alerts-date">Дата</Label>
                <Input
                  id="alerts-date"
                  type="date"
                  value={date}
                  onChange={(e) => e.target.value && setParams({ date: e.target.value })}
                  className="w-44"
                />
              </div>
              <HourSlider value={hour} onChange={(h) => setParams({ hour: h })} />
            </div>
            {insights.isPending ? (
              <Skeleton className="aspect-[3/2] w-full" />
            ) : insights.isError ? (
              <QueryError error={insights.error} onRetry={() => insights.refetch()} />
            ) : (
              <UkraineMap
                values={values}
                selected={region}
                onSelect={(slug) => setParams({ region: slug })}
                legendTitle="Історична частота"
              />
            )}
          </CardContent>
        </Card>
        <RegionPanel
          region={region}
          data={predict.data}
          pending={predict.isPending || (region !== null && predict.isIdle)}
          error={predict.isError && !aborted ? predict.error : null}
          onRetry={() => region && start && mutate({ region, start })}
        />
      </div>
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <Info className="size-4 shrink-0" />
        Статистичний аналіз історичних патернів, не прогноз атак.
      </p>
    </div>
  );
}
