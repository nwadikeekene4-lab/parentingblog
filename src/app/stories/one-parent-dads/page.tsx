import type { Metadata } from "next";

import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export const metadata: Metadata = {
  title: "One-Parent Dads Stories",
  description:
    "Read inspiring stories, challenges and victories from fathers raising children on their own.",
  alternates: {
    canonical:
      "https://parentingblog-76yt.vercel.app/stories/one-parent-dads",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function OneParentDadsPage() {
  const stories =
    await getStoriesByCategory(
      "One-Parent Dads"
    );

  return (
    <StoryCategoryLayout
      title="One-Parent Dads"
      description="Read inspiring stories, challenges and victories from fathers raising children on their own."
      image="/Images/stories/singledad.jpg"
      stories={stories}
    />
  );
    }
