import { queryOptions } from "@tanstack/react-query";
import type { ProjectSlug } from "@/lib/projects";
import { api } from "./client";
import {
  type AlertsInput,
  alertsPredictResponseSchema,
  type CarInput,
  carExtractResponseSchema,
  carPredictResponseSchema,
  healthSchema,
  insightsResponseSchema,
  metricsResponseSchema,
  type PhishingInput,
  phishingPredictResponseSchema,
  schemaResponseSchema,
} from "./contract";

export const healthQuery = queryOptions({
  queryKey: ["health"],
  queryFn: ({ signal }) => api("/health", healthSchema, { signal }),
  retry: 6,
  retryDelay: (i) => Math.min(2000 * 2 ** i, 15_000),
});

export const schemaQuery = (p: ProjectSlug) =>
  queryOptions({
    queryKey: [p, "schema"],
    queryFn: ({ signal }) => api(`/api/${p}/schema`, schemaResponseSchema, { signal }),
  });

export const metricsQuery = (p: ProjectSlug) =>
  queryOptions({
    queryKey: [p, "metrics"],
    queryFn: ({ signal }) => api(`/api/${p}/metrics`, metricsResponseSchema, { signal }),
  });

export const insightsQuery = (p: ProjectSlug) =>
  queryOptions({
    queryKey: [p, "insights"],
    queryFn: ({ signal }) => api(`/api/${p}/insights`, insightsResponseSchema, { signal }),
  });

export const predictCar = (body: CarInput, signal?: AbortSignal) =>
  api("/api/car-price/predict", carPredictResponseSchema, { method: "POST", body, signal });
export const extractCar = (text: string, signal?: AbortSignal) =>
  api("/api/car-price/extract", carExtractResponseSchema, {
    method: "POST",
    body: { text },
    signal,
  });
export const predictPhishing = (body: PhishingInput, signal?: AbortSignal) =>
  api("/api/phishing/predict", phishingPredictResponseSchema, { method: "POST", body, signal });
export const predictAlerts = (body: AlertsInput, signal?: AbortSignal) =>
  api("/api/air-alerts/predict", alertsPredictResponseSchema, { method: "POST", body, signal });
