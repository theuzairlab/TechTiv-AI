import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndustryDetailView } from "@/components/pages/industries/industry-detail-view";
import { getIndustry, industries } from "@/lib/industries";

type IndustryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({
  params,
}: IndustryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);

  if (!industry) {
    return { title: "Industry Not Found" };
  }

  return {
    title: `${industry.name} AI Solutions`,
    description: industry.description,
  };
}

export default async function IndustryPage({ params }: IndustryPageProps) {
  const { slug } = await params;
  const industry = getIndustry(slug);

  if (!industry) {
    notFound();
  }

  return <IndustryDetailView slug={slug} />;
}
