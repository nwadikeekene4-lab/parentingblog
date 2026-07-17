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
    <section className="mt-2 rounded-[36px] bg-gradient-to-br from-stone-100 via-amber-50 to-stone-200 px-5 py-10 shadow-lg sm:px-8 md:px-10 md:py-14 lg:px-12 lg:py-16">

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Featured Stories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          Explore inspiring parenting stories carefully selected to educate,
          encourage and connect families around the world. Every featured
          story offers meaningful lessons and authentic experiences.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
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
