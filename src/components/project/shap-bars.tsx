import type { Contribution } from "@/lib/api/contract";
import { formatPct, formatUsd } from "@/lib/format";

type Explanation = { base_value: number; contributions: Contribution[] };
type Unit = "usd" | "pp";

function formatBase(v: number, unit: Unit) {
  return unit === "usd" ? formatUsd(v) : formatPct(v);
}

function formatImpact(v: number, unit: Unit) {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  if (unit === "usd") return `${sign}${formatUsd(Math.abs(v))}`;
  return `${sign}${Math.round(Math.abs(v) * 100)} п.п.`;
}

/**
 * SHAP contributions as pure-CSS horizontal bars. `labels` overrides labels by feature id.
 * `invertColors`: a positive impact is bad (e.g. raises phishing / alert probability).
 */
export function ShapBars({
  explanation,
  unit,
  maxBars = 8,
  labels,
  invertColors = false,
}: {
  explanation: Explanation;
  unit: Unit;
  maxBars?: number;
  labels?: Record<string, string>;
  invertColors?: boolean;
}) {
  const sorted = [...explanation.contributions].sort((a, b) => {
    // "_other" (folded remainder) always goes last
    if (a.feature === "_other") return 1;
    if (b.feature === "_other") return -1;
    return Math.abs(b.impact) - Math.abs(a.impact);
  });
  const shown = sorted.slice(0, maxBars + (sorted.at(-1)?.feature === "_other" ? 1 : 0));
  const max = Math.max(...shown.map((c) => Math.abs(c.impact)), 1e-9);

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex items-baseline justify-between text-muted-foreground">
        <span>Чому такий результат</span>
        <span>
          База:{" "}
          <span className="text-foreground tabular-nums">
            {formatBase(explanation.base_value, unit)}
          </span>
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {shown.map((c) => {
          const color = c.impact >= 0 !== invertColors ? "var(--chart-pos)" : "var(--chart-neg)";
          return (
            <li
              key={c.feature}
              className="grid grid-cols-[minmax(0,1.3fr)_minmax(3rem,1fr)_4.75rem] items-center gap-3"
            >
              <span className="text-pretty leading-tight">{labels?.[c.feature] ?? c.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.max((Math.abs(c.impact) / max) * 100, 2)}%`,
                    background: color,
                  }}
                />
              </span>
              <span className="text-right font-medium tabular-nums" style={{ color }}>
                {formatImpact(c.impact, unit)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
