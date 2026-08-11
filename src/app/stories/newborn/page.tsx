import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

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
