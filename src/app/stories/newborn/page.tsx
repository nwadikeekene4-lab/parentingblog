import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Newborn Parenting Stories",
  description:
    "Read real experiences about the joys, challenges and unforgettable moments of caring for a newborn.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/newborn",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function NewbornPage() {
  const stories =
    await getStoriesByCategory(
      "Newborn"
    );

  return (
    <StoryCategoryLayout
      title="Newborn"
      description="Read real experiences about the joys, challenges and unforgettable moments of caring for a newborn."
      image="/Images/stories/newborn.jpeg"
      stories={stories}
    />
  );
    }
