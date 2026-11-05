import type { Metadata } from "next";
import { PhishingPredictTab } from "@/components/phishing/phishing-predict-tab";
import { ProjectLayout } from "@/components/project/project-layout";
import { getProject } from "@/lib/projects";

const project = getProject("phishing");
export const metadata: Metadata = { title: project.title };

export default function Page() {
  return <ProjectLayout project={project} predict={<PhishingPredictTab />} />;
}
