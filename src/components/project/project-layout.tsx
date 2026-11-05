"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectMeta } from "@/lib/projects";
import { DataTab } from "./data-tab";
import { ModelFooter } from "./model-footer";
import { ModelTab } from "./model-tab";

const TABS = ["predict", "model", "data"] as const;

export function ProjectLayout({ project, predict }: { project: ProjectMeta; predict: ReactNode }) {
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TABS).withDefault("predict"));
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">{project.title}</h1>
        <p className="text-muted-foreground">{project.tagline}</p>
      </header>
      <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])}>
        <TabsList>
          <TabsTrigger value="predict">Прогноз</TabsTrigger>
          <TabsTrigger value="model">Модель</TabsTrigger>
          <TabsTrigger value="data">Дані</TabsTrigger>
        </TabsList>
        <TabsContent value="predict" className="pt-4">
          {predict}
        </TabsContent>
        <TabsContent value="model" className="pt-4">
          <ModelTab project={project} />
        </TabsContent>
        <TabsContent value="data" className="pt-4">
          <DataTab project={project} />
        </TabsContent>
      </Tabs>
      <ModelFooter project={project} />
    </main>
  );
}
