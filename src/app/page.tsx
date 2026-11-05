import { ProjectCard } from "@/components/project-card";
import { PROJECTS } from "@/lib/projects";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl tracking-tight">Системи аналізу даних — 3 проєкти</h1>
        <p className="text-muted-foreground">
          Навчальний курс «Проєкт з розробки системи аналізу даних», ЛНУ ім. Івана Франка.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {PROJECTS.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </main>
  );
}
