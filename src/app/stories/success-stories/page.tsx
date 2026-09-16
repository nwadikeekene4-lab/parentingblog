import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Parenting Success Stories",
  description:
    "Be inspired by parents and families who have overcome challenges and found meaningful victories along their journeys.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/success-stories",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SuccessStoriesPage() {
  const stories =
    await getStoriesByCategory(
      "Success Stories"
    );

  return (
    <StoryCategoryLayout
      title="Success Stories"
      description="Be inspired by parents and families who have overcome challenges and found meaningful victories along their journeys."
      image="/Images/stories/parentingtips.jpeg"
      stories={stories}
    />
  );
}
