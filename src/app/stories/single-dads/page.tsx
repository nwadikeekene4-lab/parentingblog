import StoryCategoryLayout from "../components/StoryCategoryLayout";

export default function SingleDadsPage() {
  const stories = [
    {
      id: "1",
      slug: "my-journey-as-a-first-time-single-dad",
      title: "My Journey as a First-Time Single Dad",
      excerpt:
        "When my daughter was only eight months old, my life changed overnight. Becoming a single father was never part of my plan, but it became the greatest journey of my life. Through sleepless nights, difficult decisions and unforgettable milestones, I discovered that being present and loving unconditionally mattered far more than being perfect.",
      image: "/Images/stories/singledad.jpg",
      author: "Michael Johnson",
      publishedAt: "July 18, 2026",
      readTime: "6 min read",
    },
  ];

  return (
    <StoryCategoryLayout
      title="Single Dads"
      description="Read inspiring stories, challenges and victories from fathers raising children on their own."
      image="/Images/stories/singledad.jpg"
      stories={stories}
    />
  );
      }
