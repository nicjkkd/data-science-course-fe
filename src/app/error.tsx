"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16">
      <h1 className="font-semibold text-2xl tracking-tight">Щось пішло не так</h1>
      <p className="text-muted-foreground">
        Сталася неочікувана помилка. Спробуйте ще раз або оновіть сторінку.
      </p>
      {error.digest && (
        <p className="font-mono text-muted-foreground text-xs">Код: {error.digest}</p>
      )}
      <Button onClick={reset}>
        <RotateCw />
        Спробувати ще раз
      </Button>
    </main>
  );
}
