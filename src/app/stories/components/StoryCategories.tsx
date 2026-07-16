import StoryCard from "./StoryCard";

export default function StoryCategories() {
  const categories = [
    {
      title: "Single Dads",
      description:
        "Real stories, challenges and victories from fathers raising children on their own.",
      image: "/Images/stories/singledad.jpg",
      link: "/stories/single-dads",
    },
    {
      title: "Single Moms",
      description:
        "Inspiring experiences and practical advice from single mothers.",
      image: "/Images/stories/singlemum.jpg",
      link: "/stories/single-moms",
    },
    {
      title: "Pregnancy",
      description:
        "Pregnancy journeys, preparation, health and memorable moments.",
      image: "/Images/stories/pregnantwoman.jpeg",
      link: "/stories/pregnancy",
    },
    {
      title: "Newborn",
      description:
        "Helpful experiences from the first days and months with a newborn.",
      image: "/Images/stories/newborn.jpeg",
      link: "/stories/newborn",
    },
    {
      title: "Toddlers",
      description:
        "Navigate toddler milestones, learning and everyday adventures.",
      image: "/Images/stories/toddlerorg.jpeg",
      link: "/stories/toddlers",
    },
    {
      title: "School Age",
      description:
        "Parenting stories about school life, friendships and growth.",
      image: "/Images/stories/schoolage.jpeg",
      link: "/stories/school-age",
    },
    {
      title: "Teenagers",
      description:
        "Guidance and experiences on raising confident teenagers.",
      image: "/Images/stories/schoolage.jpeg", // Placeholder
      link: "/stories/teenagers",
    },
    {
      title: "Parenting Tips",
      description:
        "Practical advice and everyday parenting wisdom from families.",
      image: "/Images/stories/parentingtips.jpeg",
      link: "/stories/parenting-tips",
    },
    {
      title: "Success Stories",
      description:
        "Celebrate inspiring parenting achievements and family milestones.",
      image: "/Images/stories/schoolage.jpeg", // Placeholder
      link: "/stories/success-stories",
    },
    {
      title: "My Stories",
      description:
        "Share your own parenting journey and inspire other families.",
      image: "/Images/stories/schoolage.jpeg", // Placeholder
      link: "/stories/my-stories",
    },
  ];

  return (
    <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <StoryCard
          key={category.title}
          title={category.title}
          description={category.description}
          image={category.image}
          link={category.link}
        />
      ))}
    </section>
  );
      }
