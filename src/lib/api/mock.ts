// Mock mode: answer API calls with JSON files from public/mock/ instead of the backend.
// "/api/car-price/metrics" → "/mock/car-price.metrics.json", "/health" → "/mock/health.json"
function fixtureUrl(path: string): string {
  if (path === "/health") return "/mock/health.json";
  const [, , project, endpoint] = path.split("/");
  return `/mock/${project}.${endpoint}.json`;
}

export async function mockRequest(path: string, signal?: AbortSignal): Promise<unknown> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // so loading states are visible
  const res = await fetch(fixtureUrl(path), { signal });
  if (!res.ok) throw new Error(`No mock file for ${path}`);
  return res.json();
}
