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
    <section className="mt-20 rounded-[32px] bg-gradient-to-br from-blue-800 via-slate-700 to-slate-600 px-6 py-12 shadow-xl md:px-10 md:py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Featured Stories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-slate-200">
          Explore inspiring parenting stories handpicked to educate, encourage
          and connect families from around the world. Every featured story is
          selected to provide meaningful insights and memorable experiences.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
