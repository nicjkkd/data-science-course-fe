import { Suspense } from "react";

// Project pages keep state in the URL (nuqs → useSearchParams), which needs a Suspense boundary.
export default function ProjectsLayout({ children }: LayoutProps<"/">) {
  return <Suspense>{children}</Suspense>;
}
