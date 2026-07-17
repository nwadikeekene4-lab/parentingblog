import StoryPreviewCard from "./StoryPreviewCard";

export default function FeaturedStories() {
  const featuredStories = [
    {
      image: "/Images/story-1.jpg",
      title: "My Journey as a First-Time Dad",
      category: "Single Dads",
      excerpt:
        "Becoming a father changed my life in ways I never imagined. Here are the lessons I learned during my first year.",
      author: "Michael",
      readTime: "5 min read",
    },
    {
      image: "/Images/story-2.jpg",
      title: "Preparing for Our New Baby",
      category: "Pregnancy",
      excerpt:
        "From excitement to anxiety, this is the story of how we prepared for our baby's arrival.",
      author: "Grace",
      readTime: "6 min read",
    },
    {
      image: "/Images/story-3.jpg",
      title: "Helping My Teenager Build Confidence",
      category: "Teenagers",
      excerpt:
        "Building trust and confidence with teenagers takes patience. Here's what worked for our family.",
      author: "Daniel",
      readTime: "4 min read",
    },
  ];

  return (
    <section className="mt-20 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-10 shadow-sm">

      <div className="mb-10 text-center">

        <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          ⭐ Editor's Picks
        </span>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Featured Stories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-600 leading-7">
          Inspiring parenting stories carefully selected by our editorial team.
          Discover meaningful experiences, practical lessons and uplifting journeys
          from families around the world.
        </p>

      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredStories.map((story) => (
          <StoryPreviewCard
            key={story.title}
            image={story.image}
            title={story.title}
            category={story.category}
            excerpt={story.excerpt}
            author={story.author}
            readTime={story.readTime}
          />
        ))}
      </div>

    </section>
  );
}
