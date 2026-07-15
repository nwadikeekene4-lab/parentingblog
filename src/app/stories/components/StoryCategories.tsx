import StoryCard from "./StoryCard";

export default function StoryCategories() {
  const categories = [
    {
      title: "Single Dads",
      description: "Stories and experiences from fathers raising children on their own.",
    },
    {
      title: "Single Moms",
      description: "Real journeys, challenges, and lessons from single mothers.",
    },
    {
      title: "Pregnancy",
      description: "Stories about pregnancy journeys and becoming a parent.",
    },
    {
      title: "Newborn",
      description: "Experiences and advice from the early days of parenting.",
    },
    {
      title: "Toddlers",
      description: "Stories about raising and understanding toddlers.",
    },
    {
      title: "School Age",
      description: "Parenting experiences during children's school years.",
    },
    {
      title: "Teenagers",
      description: "Stories about guiding and supporting teenagers.",
    },
    {
      title: "Parenting Tips",
      description: "Helpful lessons and advice shared by parents.",
    },
    {
      title: "Success Stories",
      description: "Inspiring stories from parenting journeys.",
    },
    {
      title: "My Stories",
      description: "A place to share your own parenting experience.",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <StoryCard
          key={category.title}
          title={category.title}
          description={category.description}
        />
      ))}
    </section>
  );
    }
