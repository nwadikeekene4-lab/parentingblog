import StoryIntroduction from "./components/StoryIntroduction";
import StoryCategories from "./components/StoryCategories";
import FeaturedStories from "./components/FeaturedStories";

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <StoryIntroduction />

      <section className="mx-auto max-w-6xl">
        <StoryCategories />
        <FeaturedStories />
      </section>
    </main>
  );
}
