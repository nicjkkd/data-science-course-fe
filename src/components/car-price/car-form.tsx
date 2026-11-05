"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { Eraser, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, type FieldPath, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAR_TEXT_FLAGS, type CarInput, type CarInputDraft } from "@/lib/api/contract";
import { schemaQuery } from "@/lib/api/queries";
import {
  BODIES,
  BRANDS,
  CAR_REGIONS,
  CONDITIONS,
  DRIVES,
  FUELS,
  GEARBOXES,
  MODELS,
  type Option,
  TEXT_FLAG_LABELS,
} from "@/lib/car-options";

export type CarFormApi = UseFormReturn<CarInputDraft, unknown, CarInput>;
type Name = FieldPath<CarInputDraft>;

const FALLBACK: Record<string, Option[]> = {
  brand: BRANDS,
  fuel: FUELS,
  gearbox: GEARBOXES,
  body: BODIES,
  drive: DRIVES,
  region: CAR_REGIONS,
};

const toNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? undefined : Number(v);

export function CarForm({
  form,
  filled,
  pending,
  onSubmit,
  onClear,
  onExample,
}: {
  form: CarFormApi;
  filled: ReadonlySet<string>;
  pending: boolean;
  onSubmit: (input: CarInput) => void;
  onClear: () => void;
  onExample: () => void;
}) {
  const schema = useQuery(schemaQuery("car-price"));
  const options = (name: string): Option[] =>
    schema.data?.fields.find((f) => f.name === name)?.options ?? FALLBACK[name] ?? [];

  const { register, control, formState, watch } = form;
  const brand = watch("brand");
  const errors = formState.errors;

  const field = (name: Name, label: string, input: ReactNode, className?: string) => (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      data-filled={filled.has(name) || undefined}
    >
      <Label htmlFor={name}>{label}</Label>
      <div
        className={cn(
          "rounded-lg",
          filled.has(name) && "ring-2 ring-chart-2/60 ring-offset-1 ring-offset-background",
        )}
      >
        {input}
      </div>
      {errors[name as keyof typeof errors]?.message && (
        <p className="text-destructive text-xs">
          {String(errors[name as keyof typeof errors]?.message)}
        </p>
      )}
    </div>
  );

  const select = (name: Name, placeholder = "Оберіть…") => {
    const opts = options(name);
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: f, fieldState }) => (
          <Select
            items={opts}
            value={(f.value as string | undefined) ?? null}
            onValueChange={(v) => f.onChange(v ?? undefined)}
          >
            <SelectTrigger
              id={name}
              className="w-full"
              aria-invalid={fieldState.invalid || undefined}
              onBlur={f.onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    );
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-label="Параметри авто"
    >
      <div className="grid grid-cols-2 gap-3">
        {field("brand", "Марка", select("brand"))}
        {field(
          "model",
          "Модель",
          <>
            <Input
              id="model"
              list="car-models"
              autoComplete="off"
              placeholder="Passat"
              {...register("model")}
            />
            <datalist id="car-models">
              {(MODELS[brand ?? ""] ?? []).map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </>,
        )}
        {field(
          "year",
          "Рік випуску",
          <Input
            id="year"
            type="number"
            inputMode="numeric"
            min={1990}
            max={2026}
            {...register("year", { setValueAs: toNumber })}
          />,
        )}
        {field(
          "mileage_km",
          "Пробіг, км",
          <Input
            id="mileage_km"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            {...register("mileage_km", { setValueAs: toNumber })}
          />,
        )}
        {field(
          "engine_l",
          "Об'єм двигуна, л",
          <Input
            id="engine_l"
            type="number"
            inputMode="decimal"
            min={0.5}
            max={8}
            step={0.1}
            {...register("engine_l", { setValueAs: toNumber })}
          />,
        )}
        {field("fuel", "Паливо", select("fuel"))}
        {field("gearbox", "КПП", select("gearbox"))}
        {field("body", "Тип кузова", select("body"))}
        {field("drive", "Привід (необов'язково)", select("drive", "Не вказано"))}
        {field("region", "Регіон", select("region"))}
      </div>

      {field(
        "condition",
        "Стан",
        <Controller
          control={control}
          name="condition"
          render={({ field: f }) => (
            <RadioGroup
              id="condition"
              value={f.value ?? null}
              onValueChange={(v) => f.onChange(v)}
              className="flex flex-wrap gap-x-5 gap-y-2 py-1"
            >
              {CONDITIONS.map((c) => (
                <Label key={c.value} className="flex cursor-pointer items-center gap-2 font-normal">
                  <RadioGroupItem value={c.value} />
                  {c.label}
                </Label>
              ))}
            </RadioGroup>
          )}
        />,
      )}

      {field(
        "text_flags",
        "З опису оголошення",
        <Controller
          control={control}
          name="text_flags"
          render={({ field: f }) => {
            const value = f.value ?? [];
            return (
              <div id="text_flags" className="flex flex-wrap gap-1.5 py-1">
                {CAR_TEXT_FLAGS.map((flag) => {
                  const on = value.includes(flag);
                  return (
                    <button
                      key={flag}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        f.onChange(on ? value.filter((x) => x !== flag) : [...value, flag])
                      }
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {TEXT_FLAG_LABELS[flag]}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />,
      )}

      {field(
        "listing_price_usd",
        "Ціна в оголошенні, $ (необов'язково)",
        <Input
          id="listing_price_usd"
          type="number"
          inputMode="numeric"
          min={100}
          step={100}
          placeholder="10900"
          {...register("listing_price_usd", { setValueAs: toNumber })}
        />,
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Оцінюємо…" : "Оцінити ціну"}
        </Button>
        <Button type="button" variant="outline" onClick={onClear}>
          <Eraser />
          Очистити
        </Button>
        <Button type="button" variant="ghost" onClick={onExample}>
          <Sparkles />
          Приклад
        </Button>
      </div>
    </form>
  );
}
