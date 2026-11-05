"use client";

import { cn } from "cn";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartSpec } from "@/lib/api/contract";
import { formatNumber } from "@/lib/format";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
// Reference series (diagonals) are drawn dashed and muted instead of taking a palette color.
const REFERENCE_SERIES = new Set(["ідеал", "випадково", "random", "ideal"]);
const HEATMAP_MAX = 30;

const axisProps = {
  tick: { fontSize: 11, fill: "var(--muted-foreground)" },
  stroke: "var(--border)",
  tickLine: false,
  tickFormatter: (v: unknown) => (typeof v === "number" ? formatNumber(v) : String(v)),
} as const;

const tooltipProps = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
  formatter: (v: unknown) => (typeof v === "number" ? formatNumber(v) : String(v)),
} as const;

function seriesColor(name: string, i: number) {
  return REFERENCE_SERIES.has(name.toLowerCase())
    ? "var(--muted-foreground)"
    : COLORS[i % COLORS.length];
}

function isReference(name: string) {
  return REFERENCE_SERIES.has(name.toLowerCase());
}

/** Merge all series into recharts rows: { x, s0, s1, ... } keyed by x in first-seen order. */
function mergeSeries(spec: ChartSpec) {
  const rows = new Map<string | number, Record<string, string | number>>();
  spec.series.forEach((s, i) => {
    for (const p of s.points) {
      const row = rows.get(p.x) ?? { x: p.x };
      row[`s${i}`] = p.y;
      rows.set(p.x, row);
    }
  });
  const out = [...rows.values()];
  const numeric = out.every((r) => typeof r.x === "number");
  if (numeric) out.sort((a, b) => (a.x as number) - (b.x as number));
  return { rows: out, numeric };
}

type RendererProps = {
  spec: ChartSpec;
  horizontal?: boolean; // bar charts only: categories on the Y axis
  referenceX?: number; // vertical marker (threshold slider)
};

export function ChartRenderer({ spec, horizontal, referenceX }: RendererProps) {
  if (spec.kind === "heatmap") return <Heatmap spec={spec} />;

  const showLegend = spec.series.length > 1;
  const xLabel = spec.x_label
    ? { value: spec.x_label, position: "insideBottom" as const, offset: -4, fontSize: 11 }
    : undefined;
  const yLabel = spec.y_label
    ? { value: spec.y_label, angle: -90, position: "insideLeft" as const, fontSize: 11 }
    : undefined;
  const margin = { top: 8, right: 12, bottom: xLabel ? 16 : 4, left: 4 };

  if (spec.kind === "scatter") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="x"
            type="number"
            name={spec.x_label}
            label={xLabel}
            {...axisProps}
            domain={["auto", "auto"]}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={spec.y_label}
            label={yLabel}
            {...axisProps}
            width={56}
            domain={["auto", "auto"]}
          />
          <Tooltip {...tooltipProps} cursor={{ strokeDasharray: "3 3" }} />
          {spec.id === "pred_vs_actual" && <DiagonalLine spec={spec} />}
          {spec.series.map((s, i) => (
            <Scatter
              key={s.name}
              name={s.name}
              data={s.points}
              fill={seriesColor(s.name, i)}
              fillOpacity={0.55}
              isAnimationActive={false}
            />
          ))}
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const { rows, numeric } = mergeSeries(spec);

  if (spec.kind === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="x"
            type={numeric ? "number" : "category"}
            domain={numeric ? ["dataMin", "dataMax"] : undefined}
            label={xLabel}
            {...axisProps}
          />
          <YAxis label={yLabel} {...axisProps} width={56} />
          <Tooltip {...tooltipProps} />
          {referenceX !== undefined && (
            <ReferenceLine x={referenceX} stroke="var(--foreground)" strokeDasharray="4 4" />
          )}
          {spec.series.map((s, i) => (
            <Line
              key={s.name}
              dataKey={`s${i}`}
              name={s.name}
              type="monotone"
              stroke={seriesColor(s.name, i)}
              strokeWidth={isReference(s.name) ? 1.5 : 2}
              strokeDasharray={isReference(s.name) ? "5 5" : undefined}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
          {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // bar | histogram
  const histogram = spec.kind === "histogram";
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={rows}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={margin}
        barCategoryGap={histogram ? 0 : "15%"}
        barGap={histogram ? 0 : 2}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={!horizontal}
          horizontal={horizontal || !histogram}
        />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis dataKey="x" type="category" {...axisProps} width={170} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey="x" type="category" label={xLabel} {...axisProps} />
            <YAxis label={yLabel} {...axisProps} width={56} />
          </>
        )}
        <Tooltip {...tooltipProps} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
        {spec.series.map((s, i) => (
          <Bar
            key={s.name}
            dataKey={`s${i}`}
            name={s.name}
            fill={seriesColor(s.name, i)}
            fillOpacity={histogram && spec.series.length > 1 ? 0.75 : 1}
            radius={histogram ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
        {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

function DiagonalLine({ spec }: { spec: ChartSpec }) {
  const values = spec.series.flatMap((s) => s.points.flatMap((p) => [Number(p.x), p.y]));
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return (
    <ReferenceLine
      segment={[
        { x: lo, y: lo },
        { x: hi, y: hi },
      ]}
      stroke="var(--muted-foreground)"
      strokeDasharray="5 5"
      ifOverflow="extendDomain"
    />
  );
}

function Heatmap({ spec }: { spec: ChartSpec }) {
  const cells = spec.cells ?? [];
  const xs = [...new Set(cells.map((c) => c.x))].slice(0, HEATMAP_MAX);
  const ys = [...new Set(cells.map((c) => c.y))].slice(0, HEATMAP_MAX);
  const lookup = new Map(cells.map((c) => [`${c.y}\u0000${c.x}`, c.v]));
  const max = Math.max(...cells.map((c) => c.v), 0) || 1;
  const small = xs.length <= 4;

  return (
    <figure className="overflow-x-auto" aria-label={spec.title}>
      <div
        className="grid min-w-max gap-px text-xs"
        style={{
          gridTemplateColumns: `auto repeat(${xs.length}, minmax(${small ? "6rem" : "1.6rem"}, 1fr))`,
        }}
      >
        <div />
        {xs.map((x) => (
          <div key={x} className="px-0.5 pb-1 text-center text-muted-foreground">
            {small ? x : x.slice(0, 2)}
          </div>
        ))}
        {ys.map((y) => (
          <HeatmapRow key={y} y={y} xs={xs} lookup={lookup} max={max} small={small} />
        ))}
      </div>
      {spec.x_label && (
        <figcaption className="mt-2 text-center text-muted-foreground text-xs">
          {spec.x_label}
        </figcaption>
      )}
    </figure>
  );
}

function HeatmapRow({
  y,
  xs,
  lookup,
  max,
  small,
}: {
  y: string;
  xs: string[];
  lookup: Map<string, number>;
  max: number;
  small: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-end whitespace-nowrap py-0.5 pr-2 text-muted-foreground">
        {y}
      </div>
      {xs.map((x) => {
        const v = lookup.get(`${y}\u0000${x}`);
        const pct = v === undefined ? 0 : Math.round((v / max) * 100);
        return (
          <div
            key={x}
            title={v === undefined ? `${y} · ${x}: —` : `${y} · ${x}: ${formatNumber(v)}`}
            className={cn(
              "flex items-center justify-center rounded-[3px] tabular-nums",
              small ? "h-16 font-medium text-sm" : "h-5",
            )}
            style={{ background: `color-mix(in oklch, var(--chart-1) ${pct}%, transparent)` }}
          >
            {small && v !== undefined ? (
              <span className={pct > 55 ? "text-white" : undefined}>{formatNumber(v)}</span>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function ChartCard({
  spec,
  children,
  className,
  height,
}: {
  spec: Pick<ChartSpec, "title" | "description" | "kind">;
  children: ReactNode;
  className?: string;
  height?: number; // px; default h-72 (heatmaps size themselves)
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{spec.title}</CardTitle>
        {spec.description && <CardDescription>{spec.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div
          className={cn(spec.kind !== "heatmap" && height === undefined && "h-72")}
          style={height === undefined ? undefined : { height }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
