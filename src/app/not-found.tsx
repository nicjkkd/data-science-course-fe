import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16">
      <p className="font-mono text-muted-foreground text-sm">404</p>
      <h1 className="font-semibold text-2xl tracking-tight">Сторінку не знайдено</h1>
      <p className="text-muted-foreground">Можливо, посилання застаріло або містить помилку.</p>
      <Button render={<Link href="/" />} nativeButton={false}>
        На головну
      </Button>
    </main>
  );
}
