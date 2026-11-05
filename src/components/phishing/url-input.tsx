"use client";

import { Link2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { phishingInputSchema } from "@/lib/api/contract";

// Demo chips (to be replaced with test-set URLs once the backend is trained).
const EXAMPLES = [
  { url: "https://lnu.edu.ua/", safe: true },
  { url: "https://diia.gov.ua/", safe: true },
  { url: "https://github.com/login", safe: true },
  { url: "http://olx-dostavka.secure-pay24.top/ua/login", safe: false },
  { url: "http://privat24-verify.online/login.php", safe: false },
  { url: "http://192.168.4.21/monobank/secure/update", safe: false },
];

/** Adds http:// when the user typed a bare domain. */
export function normalizeUrl(raw: string): string {
  const v = raw.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `http://${v}`;
}

export function UrlInput({
  value,
  onChange,
  onCheck,
  pending,
}: {
  value: string;
  onChange: (v: string) => void;
  onCheck: (url: string) => void;
  pending: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  const submit = (raw: string) => {
    const url = normalizeUrl(raw);
    const parsed = phishingInputSchema.safeParse({ url });
    if (!raw.trim() || !parsed.success) {
      setError("Введіть коректне посилання");
      return;
    }
    setError(null);
    onCheck(parsed.data.url);
  };

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/login"
            className="h-10 pl-9 font-mono"
            aria-label="URL для перевірки"
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button type="submit" size="lg" className="h-10" disabled={pending}>
          {pending ? "Перевіряємо…" : "Перевірити"}
        </Button>
      </form>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-xs">Приклади:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.url}
            type="button"
            onClick={() => {
              onChange(ex.url);
              submit(ex.url);
            }}
            className="max-w-64 truncate rounded-full border px-2.5 py-1 font-mono text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
            title={ex.url}
          >
            <span
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
              style={{ background: ex.safe ? "var(--success)" : "var(--destructive)" }}
            />
            {ex.url.replace(/^https?:\/\//, "")}
          </button>
        ))}
      </div>
    </div>
  );
}
