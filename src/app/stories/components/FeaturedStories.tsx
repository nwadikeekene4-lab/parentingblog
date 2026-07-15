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
    <section className="mt-20">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Featured Stories
        </h2>

        <p className="mt-3 text-gray-600">
          Read inspiring parenting stories from our community.
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
