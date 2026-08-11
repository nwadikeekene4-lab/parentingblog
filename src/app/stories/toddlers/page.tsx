import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export default async function ToddlersPage() {

  const stories =
    await getStoriesByCategory(
      "Toddlers"
    );

  return (
    <StoryCategoryLayout
      title="Toddlers"
      description="Discover real stories about raising toddlers, navigating challenges and celebrating their amazing milestones."
      image="/Images/stories/toddler.jpg"
      stories={stories}
    />
  );
}
