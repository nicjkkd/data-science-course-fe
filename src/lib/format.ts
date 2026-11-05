const number = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 3 });
const oneDecimal = new Intl.NumberFormat("uk-UA", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });

export function formatNumber(v: number): string {
  return number.format(v);
}

export function formatInt(v: number): string {
  return integer.format(v);
}

/** 8400 → «$8 400» (uk-UA would print «8 400 USD»). */
export function formatUsd(v: number): string {
  return `${v < 0 ? "−" : ""}$${integer.format(Math.abs(v))}`;
}

/** Metric value for tables/cards: percentage-like keys get one decimal and «%». */
export function formatMetric(key: string, v: number): string {
  if (key.endsWith("%") || key.toUpperCase().includes("MAPE")) return `${oneDecimal.format(v)} %`;
  return number.format(v);
}

/** Probability 0..1 → «38 %». */
export function formatPct(p: number): string {
  return `${Math.round(p * 100)} %`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA");
}

/** 80 → «1 год 20 хв». */
export function formatMinutes(min: number): string {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} хв`;
  return rest === 0 ? `${h} год` : `${h} год ${rest} хв`;
}
