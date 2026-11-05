import { cn } from "cn";
import { ShapBars } from "@/components/project/shap-bars";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarPredictResponse, CarResult as CarResultData } from "@/lib/api/contract";
import { TEXT_FLAG_LABELS } from "@/lib/car-options";
import { formatUsd } from "@/lib/format";

function VerdictBadge({ result }: { result: CarResultData }) {
  if (!result.verdict) return null;
  const pct = Math.abs(Math.round(result.delta_pct ?? 0));
  if (result.verdict === "above") return <Badge variant="destructive">Вище ринку на {pct} %</Badge>;
  if (result.verdict === "below")
    return <Badge className="bg-success/15 text-success">Нижче ринку на {pct} %</Badge>;
  return <Badge variant="secondary">У межах ринку</Badge>;
}

function PriceGauge({ result }: { result: CarResultData }) {
  const [lo, hi] = result.range_usd;
  const listing = result.listing_price_usd;
  let min = lo * 0.8;
  let max = hi * 1.2;
  if (listing !== null) {
    min = Math.min(min, listing * 0.95);
    max = Math.max(max, listing * 1.05);
  }
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-semibold text-3xl tabular-nums tracking-tight">
          {formatUsd(lo)} – {formatUsd(hi)}
        </span>
        <VerdictBadge result={result} />
      </div>
      <p className="text-muted-foreground text-sm">
        Справедлива ціна ≈{" "}
        <span className="text-foreground tabular-nums">{formatUsd(result.price_usd)}</span>
        {listing !== null && (
          <>
            {" "}
            · в оголошенні{" "}
            <span className="text-foreground tabular-nums">{formatUsd(listing)}</span>
          </>
        )}
      </p>
      <div className="relative mt-6 mb-6 h-3 rounded-full bg-muted">
        <div
          className="absolute inset-y-0 rounded-full bg-chart-2/70"
          style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }}
        />
        <div
          className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-foreground/60"
          style={{ left: pos(result.price_usd) }}
          title="Прогноз"
        />
        {listing !== null && (
          <div className="absolute top-0 -translate-x-1/2" style={{ left: pos(listing) }}>
            <div
              className={cn(
                "mx-auto h-3 w-3 rotate-45 rounded-[2px] border-2 border-background",
                result.verdict === "above"
                  ? "bg-destructive"
                  : result.verdict === "below"
                    ? "bg-success"
                    : "bg-foreground",
              )}
            />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs">
              Оголошення
            </span>
          </div>
        )}
        <span className="absolute -top-5 text-muted-foreground text-xs" style={{ left: pos(lo) }}>
          ринок
        </span>
      </div>
    </div>
  );
}

export function CarResult({ data }: { data: CarPredictResponse }) {
  const { result, explanation } = data;
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Оцінка ринкової ціни</CardTitle>
        </CardHeader>
        <CardContent>
          <PriceGauge result={result} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <ShapBars explanation={explanation} unit="usd" />
        </CardContent>
      </Card>
      {result.text_flags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Знайдено в описі</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {result.text_flags.map((f) => (
              <Badge key={f} variant="outline">
                {TEXT_FLAG_LABELS[f]}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
      <p className="text-muted-foreground text-xs">Версія моделі: {data.model_version}</p>
    </div>
  );
}
