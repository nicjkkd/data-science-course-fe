# web — frontend for the three data-analysis projects

Next.js 16 (App Router) + React 19 + TypeScript strict. One app with three project pages — **Ціна вживаного авто** (`/car-price`), **Фішинг URL** (`/phishing`), **Повітряні тривоги** (`/air-alerts`) — each with three tabs: **Прогноз** (project-specific), **Модель** and **Дані** (generic, rendered from `/metrics` and `/insights`). The API contract is described in `../docs/overview.md` §3.

## Env

Copy `.env.example` to `.env.local`.

| Var | Meaning |
|-----|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL, no trailing slash (default `http://localhost:8000`). |
| `NEXT_PUBLIC_API_MOCK` | `1` = answer every API call with a JSON file from `public/mock/` (no backend needed). Anything else = call the backend. |

## Scripts (Yarn 1 only)

| Command | What it does |
|---------|--------------|
| `yarn dev` | Dev server on :3000. |
| `yarn build` / `yarn start` | Production build / serve it. |
| `yarn typecheck` | `next typegen && tsc --noEmit`. |
| `yarn lint` / `yarn lint:fix` | Biome check / apply safe fixes (Biome is the only linter + formatter). |

Gate before calling something done: `yarn typecheck && yarn lint && yarn build`.

UI primitives come only from `npx shadcn@latest add <component>` (shadcn `base-nova` style, built on Base UI).

## Mock mode

With `NEXT_PUBLIC_API_MOCK=1`, `src/lib/api/mock.ts` maps the request path to a file, with a 500 ms delay so loading states are visible:

```
GET  /health                  → public/mock/health.json
GET  /api/car-price/metrics   → public/mock/car-price.metrics.json
POST /api/phishing/predict    → public/mock/phishing.predict.json
```

Predict endpoints always return the same sample, whatever the input. The fixtures are real backend responses (`curl` of each endpoint after training); `car-price.extract.json` is hand-made because generating it calls the Anthropic API. Every response (mock or real) is validated with the zod schemas in `src/lib/api/contract.ts`; a mismatch shows «Невідповідь контракту для …». `public/mock/car-price.predict.request.json` is a sample `/predict` request body (the VW Passat) for curling the backend.

## Layout

```
src/
├── app/
│   ├── layout.tsx, providers.tsx      # TanStack Query + nuqs; Inter (cyrillic)
│   ├── page.tsx                       # home: three project cards with the headline metric
│   ├── error.tsx, not-found.tsx
│   └── (projects)/                    # layout.tsx = Suspense for URL state
│       ├── car-price/page.tsx
│       ├── phishing/page.tsx
│       └── air-alerts/page.tsx
├── components/
│   ├── ui/                            # shadcn output only
│   ├── project/                       # generic shell: layout + tabs (?tab=), metrics table,
│   │                                  # chart renderer (line/bar/histogram/scatter/heatmap),
│   │                                  # SHAP bars, threshold slider, model footer, backend status
│   ├── car-price/                     # form, paste listing → /extract → prefill, price gauge
│   ├── phishing/                      # URL input + examples, verdict, URL breakdown, history
│   └── air-alerts/                    # map, hour/date controls (?region=&hour=&date=), region panel
└── lib/
    ├── api/                           # contract.ts (zod), client.ts, mock.ts, queries.ts
    ├── projects.ts                    # project registry
    ├── regions.ts                     # region slugs ↔ Ukrainian labels ↔ GeoJSON names
    ├── car-options.ts, phishing-flags.ts, format.ts
public/
├── mock/                              # fixtures: real backend responses (extract is hand-made)
└── geo/ukraine-oblasts.json           # oblast map (source + license in public/geo/README.md)
```

Conventions: `src/lib/api/` is the only code that knows URLs; components use `queries.ts`. UI strings are Ukrainian and inline; identifiers are English. Dark mode follows the OS (`prefers-color-scheme`); all colors come from CSS tokens in `globals.css` (`--chart-*`, `--chart-pos/neg`, `--success`, `--warning`).
