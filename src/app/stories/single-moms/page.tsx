import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Single Moms Stories",
  description:
    "Discover honest experiences, challenges, strength and inspiring journeys from mothers raising children on their own.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/single-moms",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SingleMomsPage() {
  const stories =
    await getStoriesByCategory(
      "Single Moms"
    );

  return (
    <StoryCategoryLayout
      title="Single Moms"
      description="Discover honest experiences, challenges, strength and inspiring journeys from mothers raising children on their own."
      image="/Images/stories/singlemum.jpg"
      stories={stories}
    />
  );
}
