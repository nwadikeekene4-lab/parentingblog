import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export default async function SuccessStoriesPage() {

  const stories =
    await getStoriesByCategory(
      "Success Stories"
    );

  return (
    <StoryCategoryLayout
      title="Success Stories"
      description="Be inspired by parents and families who have overcome challenges and found meaningful victories along their journeys."
      image="/Images/stories/successstory.jpg"
      stories={stories}
    />
  );
}
