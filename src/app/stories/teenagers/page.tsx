import StoryCategoryLayout from "../components/StoryCategoryLayout";
import { getStoriesByCategory } from "@/lib/getStoriesByCategory";

export default async function TeenagersPage() {

  const stories =
    await getStoriesByCategory(
      "Teenagers"
    );

  return (
    <StoryCategoryLayout
      title="Teenagers"
      description="Read honest parenting experiences about raising teenagers, navigating challenges and celebrating growth."
      image="/Images/stories/teenager.jpg"
      stories={stories}
    />
  );
}
