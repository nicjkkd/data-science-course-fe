import { cn } from "cn";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import type { PhishingResult } from "@/lib/api/contract";
import { formatPct } from "@/lib/format";

const VERDICTS = {
  phishing: { label: "ФІШИНГ", icon: ShieldAlert, color: "var(--destructive)" },
  suspicious: { label: "ПІДОЗРІЛО", icon: ShieldQuestion, color: "var(--warning)" },
  safe: { label: "БЕЗПЕЧНО", icon: ShieldCheck, color: "var(--success)" },
} as const;

export const VERDICT_META = VERDICTS;

export function Verdict({ result }: { result: PhishingResult }) {
  const v = VERDICTS[result.verdict];
  const Icon = v.icon;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3" style={{ color: v.color }}>
        <Icon className="size-9" />
        <span className="font-bold text-3xl tracking-wide">{v.label}</span>
        <span className="ml-auto text-muted-foreground text-sm">
          ймовірність фішингу{" "}
          <span className={cn("font-semibold text-foreground text-lg tabular-nums")}>
            {formatPct(result.probability)}
          </span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{ width: `${result.probability * 100}%`, background: v.color }}
        />
        {[0.3, 0.7].map((t) => (
          <span
            key={t}
            className="absolute inset-y-0 w-px bg-background"
            style={{ left: `${t * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
