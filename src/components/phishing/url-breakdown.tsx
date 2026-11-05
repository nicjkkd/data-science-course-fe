import { cn } from "cn";
import type { UrlPart } from "@/lib/api/contract";
import { flagLabel } from "@/lib/phishing-flags";

const KIND_COLOR: Record<UrlPart["kind"], string> = {
  scheme: "var(--chart-5)",
  subdomain: "var(--chart-3)",
  domain: "var(--chart-1)",
  tld: "var(--chart-4)",
  port: "var(--chart-5)",
  path: "var(--chart-2)",
  query: "var(--chart-5)",
  fragment: "var(--chart-5)",
};

const KIND_LABEL: Record<UrlPart["kind"], string> = {
  scheme: "схема",
  subdomain: "піддомен",
  domain: "домен",
  tld: "TLD",
  port: "порт",
  path: "шлях",
  query: "параметри",
  fragment: "фрагмент",
};

/** The URL split into parts; flagged parts get a strong underline and a caption beneath. */
export function UrlBreakdown({ parts }: { parts: UrlPart[] }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-muted/50 p-4">
      <div className="flex w-max items-start font-mono text-base">
        {parts.map((p, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
            key={i}
            className="grid grid-rows-[auto_auto] gap-1"
          >
            <span
              className={cn("whitespace-pre px-px pb-0.5", p.flag ? "border-b-[3px]" : "border-b")}
              style={{ borderColor: p.flag ? "var(--destructive)" : KIND_COLOR[p.kind] }}
              title={KIND_LABEL[p.kind]}
            >
              {p.text}
            </span>
            <span
              className={cn(
                "max-w-40 px-px font-sans text-[11px] leading-tight",
                p.flag ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {p.flag ? flagLabel(p.flag) : KIND_LABEL[p.kind]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
