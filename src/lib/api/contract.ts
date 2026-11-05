import { z } from "zod";

// Validation messages in Ukrainian (forms show zod messages directly).
z.config(z.locales.uk());

// ---- shared ----
export const fieldOptionSchema = z.object({ value: z.string(), label: z.string() });

export const fieldSpecSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["number", "select", "radio", "text", "url", "date"]),
  required: z.boolean().default(true),
  options: z.array(fieldOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  default: z.union([z.string(), z.number()]).optional(),
  help: z.string().optional(),
});
export const schemaResponseSchema = z.object({ fields: z.array(fieldSpecSchema) });

export const contributionSchema = z.object({
  feature: z.string(),
  label: z.string(),
  value: z.string(),
  impact: z.number(),
});
export const explanationSchema = z.object({
  base_value: z.number(),
  contributions: z.array(contributionSchema),
});

export const pointSchema = z.object({ x: z.union([z.number(), z.string()]), y: z.number() });
export const seriesSchema = z.object({ name: z.string(), points: z.array(pointSchema) });
export const cellSchema = z.object({ x: z.string(), y: z.string(), v: z.number() });
export const chartSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  kind: z.enum(["line", "bar", "histogram", "scatter", "heatmap"]),
  x_label: z.string().optional(),
  y_label: z.string().optional(),
  series: z.array(seriesSchema).default([]),
  cells: z.array(cellSchema).optional(),
});

export const modelRowSchema = z.object({
  name: z.string(),
  is_baseline: z.boolean(),
  is_best: z.boolean(),
  metrics: z.record(z.string(), z.number()),
});
export const importanceSchema = z.object({
  feature: z.string(),
  label: z.string(),
  value: z.number(),
});

export const metricsResponseSchema = z.object({
  task: z.enum(["regression", "classification", "timeseries"]),
  trained_at: z.string(),
  n_train: z.number(),
  n_test: z.number(),
  models: z.array(modelRowSchema),
  importances: z.array(importanceSchema),
  charts: z.array(chartSpecSchema),
});
export const insightsResponseSchema = z.object({ charts: z.array(chartSpecSchema) });

export const healthSchema = z.object({ status: z.literal("ok"), projects: z.array(z.string()) });

const predictResponse = <T extends z.ZodType>(result: T) =>
  z.object({ result, explanation: explanationSchema, model_version: z.string() });

// ---- car-price ----
export const CAR_CONDITIONS = ["undamaged", "repaired", "needs_repair"] as const;
export const CAR_TEXT_FLAGS = [
  "accident",
  "repaint",
  "recent_repair",
  "needs_repair",
  "service_history",
  "imported_us",
] as const;

export const carInputSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2026),
  mileage_km: z.number().int().min(0).max(1_500_000),
  engine_l: z.number().min(0.5).max(8),
  fuel: z.enum(["petrol", "diesel", "hybrid", "electric", "gas"]),
  gearbox: z.enum(["manual", "auto"]),
  body: z.string().min(1),
  drive: z.enum(["fwd", "rwd", "awd"]).optional(),
  region: z.string().min(1),
  condition: z.enum(CAR_CONDITIONS),
  text_flags: z.array(z.enum(CAR_TEXT_FLAGS)).default([]),
  listing_price_usd: z.number().positive().optional(),
});
export const carResultSchema = z.object({
  price_usd: z.number(),
  range_usd: z.tuple([z.number(), z.number()]),
  listing_price_usd: z.number().nullable(),
  delta_pct: z.number().nullable(),
  verdict: z.enum(["above", "fair", "below"]).nullable(),
  text_flags: z.array(z.enum(CAR_TEXT_FLAGS)),
});
export const carPredictResponseSchema = predictResponse(carResultSchema);
export const carExtractResponseSchema = z.object({
  fields: carInputSchema.partial(),
  text_flags: z.array(z.enum(CAR_TEXT_FLAGS)),
  confidence: z.number().min(0).max(1),
});

// ---- phishing ----
export const phishingInputSchema = z.object({ url: z.string().min(4).max(2048) });
export const urlPartSchema = z.object({
  text: z.string(),
  kind: z.enum(["scheme", "subdomain", "domain", "tld", "port", "path", "query", "fragment"]),
  flag: z.string().nullable(),
});
export const phishingResultSchema = z.object({
  probability: z.number().min(0).max(1),
  verdict: z.enum(["phishing", "suspicious", "safe"]),
  parts: z.array(urlPartSchema),
});
export const phishingPredictResponseSchema = predictResponse(phishingResultSchema);

// ---- air-alerts ----
export const alertsInputSchema = z.object({
  region: z.string().min(1),
  start: z.string(), // ISO datetime, hour precision
});
export const alertsResultSchema = z.object({
  region: z.string(),
  hourly: z.array(z.object({ ts: z.string(), probability: z.number().min(0).max(1) })),
  expected_duration_min: z.number().nullable(),
});
export const alertsPredictResponseSchema = predictResponse(alertsResultSchema);

// ---- types ----
export type FieldSpec = z.infer<typeof fieldSpecSchema>;
export type Contribution = z.infer<typeof contributionSchema>;
export type ChartSpec = z.infer<typeof chartSpecSchema>;
export type MetricsResponse = z.infer<typeof metricsResponseSchema>;
export type InsightsResponse = z.infer<typeof insightsResponseSchema>;
export type CarInput = z.infer<typeof carInputSchema>;
export type CarInputDraft = z.input<typeof carInputSchema>;
export type CarResult = z.infer<typeof carResultSchema>;
export type CarTextFlag = (typeof CAR_TEXT_FLAGS)[number];
export type CarPredictResponse = z.infer<typeof carPredictResponseSchema>;
export type CarExtractResponse = z.infer<typeof carExtractResponseSchema>;
export type PhishingInput = z.infer<typeof phishingInputSchema>;
export type UrlPart = z.infer<typeof urlPartSchema>;
export type PhishingResult = z.infer<typeof phishingResultSchema>;
export type PhishingPredictResponse = z.infer<typeof phishingPredictResponseSchema>;
export type AlertsInput = z.infer<typeof alertsInputSchema>;
export type AlertsPredictResponse = z.infer<typeof alertsPredictResponseSchema>;
