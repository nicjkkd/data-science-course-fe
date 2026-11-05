import type { Metadata } from "next";
import { AlertsPredictTab } from "@/components/air-alerts/alerts-predict-tab";
import { ProjectLayout } from "@/components/project/project-layout";
import { getProject } from "@/lib/projects";

const project = getProject("air-alerts");
export const metadata: Metadata = { title: project.title };

export default function Page() {
  return <ProjectLayout project={project} predict={<AlertsPredictTab />} />;
}
