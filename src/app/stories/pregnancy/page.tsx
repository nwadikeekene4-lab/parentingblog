import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

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
