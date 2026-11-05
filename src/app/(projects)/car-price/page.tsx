import type { Metadata } from "next";
import { CarPredictTab } from "@/components/car-price/car-predict-tab";
import { ProjectLayout } from "@/components/project/project-layout";
import { getProject } from "@/lib/projects";

const project = getProject("car-price");
export const metadata: Metadata = { title: project.title };

export default function Page() {
  return <ProjectLayout project={project} predict={<CarPredictTab />} />;
}
