import StoryCard from "./StoryCard";

export default function StoryCategories() {
  const categories = [
    {
      title: "Single Dads",
      description:
        "Stories and experiences from fathers raising children on their own.",
      icon: "👨‍👧",
      link: "/stories/single-dads",
    },
    {
      title: "Single Moms",
      description:
        "Real journeys, challenges, and lessons from single mothers.",
      icon: "👩‍👧",
      link: "/stories/single-moms",
    },
    {
      title: "Pregnancy",
      description:
        "Stories about pregnancy journeys and becoming a parent.",
      icon: "🤰",
      link: "/stories/pregnancy",
    },
    {
      title: "Newborn",
      description:
        "Experiences and advice from the early days of parenting.",
      icon: "👶",
      link: "/stories/newborn",
    },
    {
      title: "Toddlers",
      description:
        "Stories about raising and understanding toddlers.",
      icon: "🧸",
      link: "/stories/toddlers",
    },
    {
      title: "School Age",
      description:
        "Parenting experiences during children's school years.",
      icon: "🎒",
      link: "/stories/school-age",
    },
    {
      title: "Teenagers",
      description:
        "Stories about guiding and supporting teenagers.",
      icon: "🧑",
      link: "/stories/teenagers",
    },
    {
      title: "Parenting Tips",
      description:
        "Helpful lessons and advice shared by parents.",
      icon: "💡",
      link: "/stories/parenting-tips",
    },
    {
      title: "Success Stories",
      description:
        "Inspiring stories from different parenting journeys.",
      icon: "⭐",
      link: "/stories/success-stories",
    },
    {
      title: "My Stories",
      description:
        "A place to share and manage your own parenting experiences.",
      icon: "✍️",
      link: "/stories/my-stories",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <StoryCard
          key={category.title}
          title={category.title}
          description={category.description}
          icon={category.icon}
          link={category.link}
        />
      ))}
    </section>
  );
      }
