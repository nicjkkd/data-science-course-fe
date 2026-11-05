"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackendStatus } from "@/components/project/backend-status";
import { PROJECTS } from "@/lib/projects";

const MOCK = process.env.NEXT_PUBLIC_API_MOCK === "1";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-2 sm:h-14 sm:flex-row sm:items-center sm:gap-6 sm:py-0">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          Системи аналізу даних
        </Link>
        <nav className="-mx-2.5 flex items-center gap-1 overflow-x-auto text-sm sm:mx-0">
          {PROJECTS.map((p) => {
            const active = pathname === `/${p.slug}`;
            return (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-muted font-medium text-foreground",
                )}
              >
                {p.title}
              </Link>
            );
          })}
        </nav>
      </div>
      {!MOCK && <BackendStatus />}
    </header>
  );
}
