export type ProjectSlug = "car-price" | "phishing" | "air-alerts";
export type TaskType = "regression" | "classification" | "timeseries";

export type ProjectMeta = {
  slug: ProjectSlug;
  title: string;
  tagline: string; // one sentence: the problem
  taskLabel: string; // «Регресія» etc.
  task: TaskType;
  headlineMetric: string; // key into metrics.models[best].metrics, e.g. "MAE"
};

export const PROJECTS: readonly ProjectMeta[] = [
  {
    slug: "car-price",
    title: "Ціна вживаного авто",
    tagline: "Чи справедлива ціна в оголошенні і чому",
    taskLabel: "Регресія",
    task: "regression",
    headlineMetric: "MAE",
  },
  {
    slug: "phishing",
    title: "Фішинг URL",
    tagline: "Чи безпечне посилання і які в ньому червоні прапорці",
    taskLabel: "Класифікація",
    task: "classification",
    headlineMetric: "ROC_AUC",
  },
  {
    slug: "air-alerts",
    title: "Повітряні тривоги",
    tagline: "Ймовірність тривоги в області за годиною — аналіз патернів",
    taskLabel: "Часові ряди",
    task: "timeseries",
    headlineMetric: "Brier",
  },
] as const;

export function getProject(slug: ProjectSlug): ProjectMeta {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project: ${slug}`);
  return p;
}
