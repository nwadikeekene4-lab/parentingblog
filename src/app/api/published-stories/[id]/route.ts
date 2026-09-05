import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  categories,
  storyImages,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UploadedImage = {
  url: string;
  publicId: string;
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load a published story belonging to the currently authenticated user.
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const publishedStory = await db.query.stories.findFirst({
      where: (story, { and, eq }) =>
        and(
          eq(story.id, id),
          eq(story.authorId, user.id),
          eq(story.status, "published"),
          eq(story.isDeleted, false)
        ),
      with: {
        category: true,
        images: true,
      },
    });

    if (!publishedStory) {
      return NextResponse.json(
        { message: "Published story not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        draft: publishedStory,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Fetch published story for edit error:",
      error
    );

    return NextResponse.json(
      {
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}
