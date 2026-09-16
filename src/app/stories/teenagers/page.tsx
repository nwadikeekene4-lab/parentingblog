import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Teenage Parenting Stories",
  description:
    "Read honest parenting experiences about raising teenagers, navigating challenges and celebrating growth.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/teenagers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TeenagersPage() {
  const stories =
    await getStoriesByCategory(
      "Teenagers"
    );

  return (
    <StoryCategoryLayout
      title="Teenagers"
      description="Read honest parenting experiences about raising teenagers, navigating challenges and celebrating growth."
      image="/Images/stories/teen.jpeg"
      stories={stories}
    />
  );
}
