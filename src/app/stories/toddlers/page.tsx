import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Toddler Parenting Stories",
  description:
    "Discover real stories about raising toddlers, navigating challenges and celebrating their amazing milestones.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/toddlers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ToddlersPage() {
  const stories =
    await getStoriesByCategory(
      "Toddlers"
    );

  return (
    <StoryCategoryLayout
      title="Toddlers"
      description="Discover real stories about raising toddlers, navigating challenges and celebrating their amazing milestones."
      image="/Images/stories/toddlerorg.jpeg"
      stories={stories}
    />
  );
}
