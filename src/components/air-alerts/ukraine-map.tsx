"use client";

import { cn } from "cn";
import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { formatPct } from "@/lib/format";
import { GEO_NAME_TO_SLUG, regionLabel } from "@/lib/regions";

const STEPS = [
  { max: 0.1, label: "<10 %", mix: 14 },
  { max: 0.3, label: "10–30 %", mix: 38 },
  { max: 0.5, label: "30–50 %", mix: 64 },
  { max: Number.POSITIVE_INFINITY, label: ">50 %", mix: 92 },
];

const slugOf = (geo: { properties: { shapeName?: string } | null }) =>
  GEO_NAME_TO_SLUG[geo.properties?.shapeName ?? ""] ?? "";

function fillFor(v: number | undefined) {
  if (v === undefined) return "var(--muted)";
  const step = STEPS.find((s) => v < s.max) ?? STEPS[STEPS.length - 1];
  return `color-mix(in oklch, var(--chart-neg) ${step.mix}%, var(--muted))`;
}

export function UkraineMap({
  values,
  selected,
  onSelect,
  legendTitle,
}: {
  values: Record<string, number>;
  selected: string | null;
  onSelect: (slug: string) => void;
  legendTitle: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const shown = hover ?? selected;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/2] w-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [31.2, 48.4], scale: 2400 }}
          width={900}
          height={600}
          className="h-full w-full"
          aria-label="Карта областей України"
        >
          <Geographies geography="/geo/ukraine-oblasts.json">
            {({ geographies }) =>
              // the selected region is drawn last so its outline isn't covered by neighbours
              [...geographies]
                .sort((a, b) => Number(slugOf(a) === selected) - Number(slugOf(b) === selected))
                .map((geo) => {
                  const slug = slugOf(geo);
                  const isSelected = slug === selected;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => slug && onSelect(slug)}
                      onMouseEnter={() => setHover(slug)}
                      onMouseLeave={() => setHover(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={regionLabel(slug)}
                      aria-pressed={isSelected}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && slug) {
                          e.preventDefault();
                          onSelect(slug);
                        }
                      }}
                      fill={fillFor(values[slug])}
                      className={cn(
                        "cursor-pointer outline-none transition-[stroke-width]",
                        isSelected
                          ? "stroke-[2.5] stroke-foreground"
                          : "stroke-[0.8] stroke-background hover:stroke-[1.5] hover:stroke-foreground focus-visible:stroke-[1.5] focus-visible:stroke-foreground",
                      )}
                    />
                  );
                })
            }
          </Geographies>
        </ComposableMap>
        {shown && (
          <div className="pointer-events-none absolute top-2 left-2 rounded-md border bg-popover px-2.5 py-1.5 text-popover-foreground text-xs shadow-sm">
            <div className="font-medium">{regionLabel(shown)}</div>
            <div className="text-muted-foreground">
              {legendTitle}: {values[shown] === undefined ? "—" : formatPct(values[shown])}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
        <span>{legendTitle}:</span>
        {STEPS.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span
              className={cn("inline-block size-3 rounded-sm border")}
              style={{
                background: `color-mix(in oklch, var(--chart-neg) ${s.mix}%, var(--muted))`,
              }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
