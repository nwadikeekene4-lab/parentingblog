import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { stories, users, categories } from "@/db/schema";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function StoryPage({
  params,
}: Props) {
  const { slug } = await params;

  const story = await db.query.stories.findFirst({
    where: eq(stories.slug, slug),

    with: {
      author: true,
      category: true,
      images: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!story) {
    notFound();
  }

  // Type assertion to ensure TS recognizes the relations correctly
  const author = story.author as typeof users.$inferSelect;
  const category = story.category as typeof categories.$inferSelect;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">

      <h1 className="text-4xl font-bold">
        {story.title}
      </h1>

      <p className="mt-3 text-gray-600">
        By {author?.displayName}
      </p>

      <p className="mt-1 text-gray-500">
        {category?.name}
      </p>

    </main>
  );
}

