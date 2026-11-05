"use client";

import { Slider } from "@/components/ui/slider";

export function HourSlider({ value, onChange }: { value: number; onChange: (h: number) => void }) {
  return (
    <div className="flex min-w-56 flex-1 flex-col gap-2">
      <span className="text-sm">
        Година:{" "}
        <span className="font-medium tabular-nums">{String(value).padStart(2, "0")}:00</span>
      </span>
      <Slider
        min={0}
        max={23}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? (v[0] ?? 0) : v)}
        aria-label="Година"
      />
    </div>
  );
}
