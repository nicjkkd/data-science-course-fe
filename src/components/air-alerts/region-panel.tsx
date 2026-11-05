import { Clock, MapPin } from "lucide-react";
import { QueryError } from "@/components/project/query-state";
import { ShapBars } from "@/components/project/shap-bars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlertsPredictResponse } from "@/lib/api/contract";
import { formatMinutes, formatPct } from "@/lib/format";
import { regionLabel } from "@/lib/regions";

export function RegionPanel({
  region,
  data,
  pending,
  error,
  onRetry,
}: {
  region: string | null;
  data: AlertsPredictResponse | undefined;
  pending: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (!region) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        <MapPin className="size-8" />
        <p>Оберіть область на карті</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{regionLabel(region)} область</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {pending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : error ? (
          <QueryError error={error} onRetry={onRetry} />
        ) : data ? (
          <>
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Ймовірність тривоги на наступні 6 годин
              </span>
              <ul className="flex flex-col gap-1.5">
                {data.result.hourly.map((h) => (
                  <li
                    key={h.ts}
                    className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-sm"
                  >
                    {/* the hour as sent by the backend (Kyiv time), not converted to the browser's zone */}
                    <span className="text-muted-foreground tabular-nums">{h.ts.slice(11, 16)}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${Math.max(h.probability * 100, 1)}%`,
                          background: "var(--chart-neg)",
                        }}
                      />
                    </span>
                    <span className="text-right font-medium tabular-nums">
                      {formatPct(h.probability)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {data.result.expected_duration_min !== null && (
              <p className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-muted-foreground" />
                Очікувана тривалість: ~{formatMinutes(data.result.expected_duration_min)}
              </p>
            )}
            <ShapBars explanation={data.explanation} unit="pp" invertColors />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
