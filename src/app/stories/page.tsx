import StoryIntroduction from "./components/StoryIntroduction";
import StoryCategories from "./components/StoryCategories";
import FeaturedStories from "./components/FeaturedStories";

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero */}
      <StoryIntroduction />

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6">

        {/* Categories */}
        <div className="mt-12 md:mt-16 lg:mt-20 mb-12">
          <StoryCategories />
        </div>

        {/* Featured Stories */}
        <FeaturedStories />

      </section>

    </main>
  );
}
