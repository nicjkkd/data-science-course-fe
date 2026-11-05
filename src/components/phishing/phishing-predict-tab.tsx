"use client";

import { useMutation } from "@tanstack/react-query";
import { ShieldQuestion } from "lucide-react";
import { useRef, useState } from "react";
import { QueryError } from "@/components/project/query-state";
import { ShapBars } from "@/components/project/shap-bars";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { predictPhishing } from "@/lib/api/queries";
import { PHISHING_FLAGS } from "@/lib/phishing-flags";
import { type HistoryEntry, SessionHistory } from "./session-history";
import { UrlBreakdown } from "./url-breakdown";
import { UrlInput } from "./url-input";
import { Verdict } from "./verdict";

const HISTORY_SIZE = 8;

export function PhishingPredictTab() {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const lastUrl = useRef<string | null>(null);

  const predict = useMutation({
    mutationFn: (url: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastUrl.current = url;
      return predictPhishing({ url }, controller.signal);
    },
    onSuccess: (data, url) => {
      const entry = { url, verdict: data.result.verdict, probability: data.result.probability };
      setHistory((h) => [entry, ...h.filter((e) => e.url !== url)].slice(0, HISTORY_SIZE));
    },
  });
  const aborted = predict.error instanceof DOMException && predict.error.name === "AbortError";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <UrlInput
        value={value}
        onChange={setValue}
        onCheck={(url) => predict.mutate(url)}
        pending={predict.isPending}
      />

      {predict.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : predict.isError && !aborted ? (
        <QueryError
          error={predict.error}
          onRetry={lastUrl.current ? () => predict.mutate(lastUrl.current as string) : undefined}
        />
      ) : predict.data ? (
        <Card>
          <CardContent className="flex flex-col gap-6">
            <Verdict result={predict.data.result} />
            <UrlBreakdown parts={predict.data.result.parts} />
            <ShapBars
              explanation={predict.data.explanation}
              unit="pp"
              labels={PHISHING_FLAGS}
              invertColors
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <ShieldQuestion className="size-8" />
          <p>Вставте посилання або оберіть приклад</p>
        </div>
      )}

      <SessionHistory
        entries={history}
        onSelect={(url) => {
          setValue(url);
          predict.mutate(url);
        }}
      />
    </div>
  );
}
