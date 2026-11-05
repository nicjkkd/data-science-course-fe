import type { Metadata } from "next";
import "./globals.css";
import { cn } from "cn";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Системи аналізу даних", template: "%s · Системи аналізу даних" },
  description: "Три навчальні проєкти: ціна вживаного авто, фішинг URL, повітряні тривоги.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
