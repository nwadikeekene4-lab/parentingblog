import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

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
