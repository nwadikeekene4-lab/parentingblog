import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

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
