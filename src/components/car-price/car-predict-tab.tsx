"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CarFront, Info } from "lucide-react";
import { useRef, useState } from "react";
import { type DefaultValues, useForm } from "react-hook-form";
import type { z } from "zod";
import { QueryError } from "@/components/project/query-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type CarExtractResponse,
  type CarInput,
  type CarInputDraft,
  carInputSchema,
} from "@/lib/api/contract";
import { predictCar } from "@/lib/api/queries";
import { PASSAT_EXAMPLE } from "@/lib/car-options";
import { CarForm } from "./car-form";
import { CarResult } from "./car-result";
import { PasteListing } from "./paste-listing";

const DEFAULTS: DefaultValues<CarInputDraft> = {
  brand: "",
  model: "",
  year: undefined,
  mileage_km: undefined,
  engine_l: undefined,
  fuel: undefined,
  gearbox: undefined,
  body: "",
  drive: undefined,
  region: "",
  condition: "undamaged",
  text_flags: [],
  listing_price_usd: undefined,
};

type Mode = "form" | "paste";

// Short form messages; anything not covered falls back to zod's Ukrainian locale.
const formErrors: z.core.$ZodErrorMap = (iss) => {
  if (iss.code === "invalid_type" && (iss.input === undefined || Number.isNaN(iss.input)))
    return "Обов'язкове поле";
  if (iss.code === "invalid_value") return "Оберіть значення";
  if (iss.code === "too_small")
    return iss.origin === "string" ? "Обов'язкове поле" : `Не менше ${iss.minimum}`;
  if (iss.code === "too_big") return `Не більше ${iss.maximum}`;
  return undefined;
};

export function CarPredictTab() {
  const form = useForm<CarInputDraft, unknown, CarInput>({
    resolver: zodResolver(carInputSchema, { error: formErrors }),
    defaultValues: DEFAULTS,
  });
  const [mode, setMode] = useState<Mode>("form");
  const [filled, setFilled] = useState<ReadonlySet<string>>(new Set());
  const [confidence, setConfidence] = useState<number | null>(null);
  const lastInput = useRef<CarInput | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const predict = useMutation({
    mutationFn: (input: CarInput) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastInput.current = input;
      return predictCar(input, controller.signal);
    },
  });
  const aborted = predict.error instanceof DOMException && predict.error.name === "AbortError";

  const onExtracted = (r: CarExtractResponse) => {
    form.reset({ ...DEFAULTS, ...r.fields, text_flags: r.text_flags });
    setFilled(new Set([...Object.keys(r.fields), ...(r.text_flags.length ? ["text_flags"] : [])]));
    setConfidence(r.confidence);
    setMode("form");
  };

  const clear = () => {
    form.reset(DEFAULTS);
    setFilled(new Set());
    setConfidence(null);
    predict.reset();
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <Card>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="mb-3 w-full">
              <TabsTrigger value="form">Форма</TabsTrigger>
              <TabsTrigger value="paste">Вставити оголошення</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="flex flex-col gap-4">
              {confidence !== null && (
                <Alert>
                  <Info />
                  <AlertDescription>
                    Перевірте поля — заповнено автоматично (впевненість{" "}
                    {Math.round(confidence * 100)} %)
                  </AlertDescription>
                </Alert>
              )}
              <CarForm
                form={form}
                filled={filled}
                pending={predict.isPending}
                onSubmit={(input) => predict.mutate(input)}
                onClear={clear}
                onExample={() => {
                  form.reset(PASSAT_EXAMPLE);
                  setFilled(new Set());
                  setConfidence(null);
                }}
              />
            </TabsContent>
            <TabsContent value="paste">
              <PasteListing onExtracted={onExtracted} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="min-w-0">
        {predict.isPending ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        ) : predict.isError && !aborted ? (
          <QueryError
            error={predict.error}
            onRetry={
              lastInput.current ? () => predict.mutate(lastInput.current as CarInput) : undefined
            }
          />
        ) : predict.data ? (
          <CarResult data={predict.data} />
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <CarFront className="size-8" />
            <p>Заповніть форму або вставте текст оголошення</p>
          </div>
        )}
      </div>
    </div>
  );
}
