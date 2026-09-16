import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Pregnancy Stories",
  description:
    "Explore real pregnancy experiences, memorable moments, challenges and journeys shared by parents.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/pregnancy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PregnancyPage() {
  const stories =
    await getStoriesByCategory(
      "Pregnancy"
    );

  return (
    <StoryCategoryLayout
      title="Pregnancy"
      description="Explore real pregnancy experiences, memorable moments, challenges and journeys shared by parents."
      image="/Images/stories/pregnantwoman.jpeg"
      stories={stories}
    />
  );
}
