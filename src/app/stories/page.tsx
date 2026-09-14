import StoryIntroduction from "./components/StoryIntroduction";
import StoryCategories from "./components/StoryCategories";
import FeaturedStories from "./components/FeaturedStories";
import VisitorTracker from "../components/analytics/VisitorTracker";

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-[#fff9f6] text-[#35232d]">
      <VisitorTracker />

      {/* Hero */}
      <StoryIntroduction />

      {/* Main Content */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Categories */}
        <div className="mt-5 mb-5 sm:mt-8 sm:mb-8 lg:mt-10 lg:mb-10">
          <StoryCategories />
        </div>

        {/* Featured Stories */}
        <FeaturedStories />
      </section>
    </main>
  );
}
