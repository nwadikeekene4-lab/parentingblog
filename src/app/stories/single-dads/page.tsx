import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "Single Dads Stories",
  description:
    "Read inspiring stories, challenges and victories from fathers raising children on their own.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/single-dads",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SingleDadsPage() {
  const stories =
    await getStoriesByCategory(
      "Single Dads"
    );

  return (
    <StoryCategoryLayout
      title="Single Dads"
      description="Read inspiring stories, challenges and victories from fathers raising children on their own."
      image="/Images/stories/singledad.jpg"
      stories={stories}
    />
  );
}
