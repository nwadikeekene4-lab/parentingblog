import type { MetadataRoute } from "next";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { stories } from "@/db/schema";

const siteUrl = "https://parentingblog-76yt.vercel.app";

const categoryUrls = [
  "single-dads",
  "single-moms",
  "pregnancy",
  "newborn",
  "toddlers",
  "teenagers",
  "success-stories",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedStories = await db
    .select({
      slug: stories.slug,
      updatedAt: stories.updatedAt,
      publishedAt: stories.publishedAt,
    })
    .from(stories)
    .where(
      and(
        eq(stories.status, "published"),
        eq(stories.isDeleted, false)
      )
    )
    .orderBy(desc(stories.publishedAt));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryUrls.map((category) => ({
      url: `${siteUrl}/stories/${category}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const storyPages: MetadataRoute.Sitemap =
    publishedStories.map((story) => ({
      url: `${siteUrl}/stories/${story.slug}`,
      lastModified:
        story.updatedAt ??
        story.publishedAt ??
        new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticPages, ...storyPages];
    }
