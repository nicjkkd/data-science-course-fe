"use client";

import { useMutation } from "@tanstack/react-query";
import { ScanText, X } from "lucide-react";
import { useRef, useState } from "react";
import { QueryError } from "@/components/project/query-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CarExtractResponse } from "@/lib/api/contract";
import { extractCar } from "@/lib/api/queries";

/** Paste listing text → Claude extracts fields → the parent pre-fills the form. Never predicts. */
export function PasteListing({ onExtracted }: { onExtracted: (r: CarExtractResponse) => void }) {
  const [text, setText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const extract = useMutation({
    mutationFn: (t: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return extractCar(t, controller.signal);
    },
    onSuccess: onExtracted,
  });
  const aborted = extract.error instanceof DOMException && extract.error.name === "AbortError";

  const cancel = () => {
    abortRef.current?.abort();
    extract.reset();
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim().length >= 20) extract.mutate(text);
      }}
    >
      <Label htmlFor="listing-text">Текст оголошення</Label>
      <Textarea
        id="listing-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        className="min-h-48"
        placeholder="Volkswagen Passat B8 2016, 2.0 TDI, автомат, універсал. Пробіг 187 тис. км. Свіжопригнаний, сервісна історія, крило фарбоване. Львів. 10 900 $"
      />
      <p className="text-muted-foreground text-xs">
        Поля буде розпізнано автоматично — перед оцінкою їх треба перевірити.
      </p>
      <div className="flex gap-2">
        <Button type="submit" disabled={extract.isPending || text.trim().length < 20}>
          <ScanText />
          {extract.isPending ? "Розпізнаємо…" : "Розпізнати"}
        </Button>
        {extract.isPending && (
          <Button type="button" variant="outline" onClick={cancel}>
            <X />
            Скасувати
          </Button>
        )}
      </div>
      {extract.isError && !aborted && (
        <QueryError error={extract.error} onRetry={() => extract.mutate(text)} />
      )}
    </form>
  );
}
