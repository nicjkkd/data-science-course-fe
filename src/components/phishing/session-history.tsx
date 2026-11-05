import { History } from "lucide-react";
import type { PhishingResult } from "@/lib/api/contract";
import { VERDICT_META } from "./verdict";

export type HistoryEntry = { url: string; verdict: PhishingResult["verdict"]; probability: number };

export function SessionHistory({
  entries,
  onSelect,
}: {
  entries: HistoryEntry[];
  onSelect: (url: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
        <History className="size-4" />
        Перевірені в цій сесії
      </h2>
      <ul className="flex flex-col divide-y rounded-lg border">
        {entries.map((e) => {
          const v = VERDICT_META[e.verdict];
          const Icon = v.icon;
          return (
            <li key={e.url}>
              <button
                type="button"
                onClick={() => onSelect(e.url)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
              >
                <Icon className="size-4 shrink-0" style={{ color: v.color }} />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{e.url}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {Math.round(e.probability * 100)} %
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
