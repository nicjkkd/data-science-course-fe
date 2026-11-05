"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, ServerCrash } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { healthQuery } from "@/lib/api/queries";

/** Free-tier backends sleep; tell the user while /health is waking it up. */
export function BackendStatus() {
  const { isPending, isError, refetch, isFetching } = useQuery(healthQuery);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isPending) return;
    const t = setTimeout(() => setSlow(true), 2000);
    return () => clearTimeout(t);
  }, [isPending]);

  if (isError) {
    return (
      <div className="border-b bg-destructive/10 text-destructive text-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <ServerCrash className="size-4" />
          <span>Сервер недоступний.</span>
          <Button size="xs" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Спробувати ще раз
          </Button>
        </div>
      </div>
    );
  }
  if (isPending && slow) {
    return (
      <div className="border-b bg-muted text-muted-foreground text-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
          <Loader2 className="size-4 animate-spin" />
          Сервер прокидається, зазвичай до 30 с…
        </div>
      </div>
    );
  }
  return null;
}
