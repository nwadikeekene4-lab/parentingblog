import { NextResponse } from "next/server";
import { and, desc, eq, ilike, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  stories,
  storyImages,
  storyRevisions,
  storyRevisionImages,
  categories,
  users,
  notifications,
} from "@/db/schema";

import { getCurrentUser } from "@/lib/session";

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Return both:
|
| 1. New stories waiting for administrator review
| 2. Updates to already-published stories waiting for review
|--------------------------------------------------------------------------
*/

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    /*
    |--------------------------------------------------------------------------
    | NEW STORY SUBMISSIONS
    |--------------------------------------------------------------------------
    */

    const storyConditions = [
      eq(stories.status, "pending_review"),
      eq(stories.isDeleted, false),
    ];

    if (search) {
      storyConditions.push(
        ilike(stories.title, `%${search}%`)
      );
    }

    const pendingStories = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        excerpt: stories.excerpt,
        coverImage: stories.coverImage,

        category: categories.name,
        categoryId: categories.id,

        authorId: users.id,
        authorName: users.displayName,
        authorEmail: users.email,

        status: stories.status,
        createdAt: stories.createdAt,
        updatedAt: stories.updatedAt,
      })
      .from(stories)
      .leftJoin(
        categories,
        eq(stories.categoryId, categories.id)
      )
      .leftJoin(
        users,
        eq(stories.authorId, users.id)
      )
      .where(and(...storyConditions))
      .orderBy(desc(stories.updatedAt));

    /*
    |--------------------------------------------------------------------------
    | PUBLISHED STORY REVISIONS
    |--------------------------------------------------------------------------
    */

    const revisionConditions = [
      eq(storyRevisions.status, "pending_review"),
    ];

    if (search) {
      revisionConditions.push(
        ilike(storyRevisions.title, `%${search}%`)
      );
    }

    const pendingRevisions = await db
      .select({
        revisionId: storyRevisions.id,
        storyId: storyRevisions.storyId,

        title: storyRevisions.title,
        slug: storyRevisions.slug,
        excerpt: storyRevisions.excerpt,
        coverImage: storyRevisions.coverImage,

        category: categories.name,
        categoryId: categories.id,

        authorId: users.id,
        authorName: users.displayName,
        authorEmail: users.email,

        status: storyRevisions.status,
        createdAt: storyRevisions.createdAt,
        updatedAt: storyRevisions.updatedAt,
      })
      .from(storyRevisions)
      .leftJoin(
        categories,
        eq(storyRevisions.categoryId, categories.id)
      )
      .leftJoin(
        users,
        eq(storyRevisions.authorId, users.id)
      )
      .where(and(...revisionConditions))
      .orderBy(desc(storyRevisions.updatedAt));

    /*
    |--------------------------------------------------------------------------
    | COMBINE BOTH TYPES
    |--------------------------------------------------------------------------
    */

    const combinedStories = [
      ...pendingStories.map((story) => ({
        id: story.id,
        revisionId: null as string | null,

        title: story.title,
        slug: story.slug,
        excerpt: story.excerpt,
        coverImage: story.coverImage,

        category: story.category ?? "Uncategorized",
        categoryId: story.categoryId,

        author: {
          id: story.authorId,
          name: story.authorName ?? "Unknown author",
          email: story.authorEmail ?? "",
        },

        submissionType: "new_submission" as const,
        status: story.status,

        submittedAt: story.createdAt,
        updatedAt: story.updatedAt,
      })),

      ...pendingRevisions.map((revision) => ({
        id: revision.storyId,
        revisionId: revision.revisionId,

        title: revision.title,
        slug: revision.slug,
        excerpt: revision.excerpt,
        coverImage: revision.coverImage,

        category: revision.category ?? "Uncategorized",
        categoryId: revision.categoryId,

        author: {
          id: revision.authorId,
          name: revision.authorName ?? "Unknown author",
          email: revision.authorEmail ?? "",
        },

        submissionType: "story_update" as const,
        status: revision.status,

        submittedAt: revision.createdAt,
        updatedAt: revision.updatedAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
    );

    return NextResponse.json(
      {
        stories: combinedStories,
        count: combinedStories.length,
        search,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin pending review GET error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load pending stories.",
      },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Approve or reject:
|
| 1. New story submissions
| 2. Published-story revisions
|--------------------------------------------------------------------------
*/

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const action =
      data.action === "approve" ||
      data.action === "reject"
        ? data.action
        : null;

    if (!action) {
      return NextResponse.json(
        { message: "Invalid review action." },
        { status: 400 }
      );
    }

    const storyId =
      typeof data.storyId === "string"
        ? data.storyId.trim()
        : "";

    if (!storyId) {
      return NextResponse.json(
        { message: "Story ID is required." },
        { status: 400 }
      );
    }

    const feedback =
      typeof data.feedback === "string"
        ? data.feedback.trim()
        : "";

    if (action === "reject") {
      if (!feedback) {
        return NextResponse.json(
          {
            message:
              "Please provide a reason for rejecting this story.",
          },
          { status: 400 }
        );
      }

      if (feedback.length < 5) {
        return NextResponse.json(
          {
            message:
              "Rejection feedback must be at least 5 characters.",
          },
          { status: 400 }
        );
      }

      if (feedback.length > 1000) {
        return NextResponse.json(
          {
            message:
              "Rejection feedback cannot exceed 1,000 characters.",
          },
          { status: 400 }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK FOR PUBLISHED-STORY REVISION
    |--------------------------------------------------------------------------
    */

    const [pendingRevision] = await db
      .select({
        id: storyRevisions.id,
        storyId: storyRevisions.storyId,
        title: storyRevisions.title,
        slug: storyRevisions.slug,
        excerpt: storyRevisions.excerpt,
        content: storyRevisions.content,
        coverImage: storyRevisions.coverImage,
        coverImagePublicId:
          storyRevisions.coverImagePublicId,
        categoryId: storyRevisions.categoryId,
        authorId: storyRevisions.authorId,
      })
      .from(storyRevisions)
      .where(
        and(
          eq(storyRevisions.storyId, storyId),
          eq(
            storyRevisions.status,
            "pending_review"
          )
        )
      )
      .limit(1);

    /*
    |--------------------------------------------------------------------------
    | PUBLISHED STORY REVISION
    |--------------------------------------------------------------------------
    */

    if (pendingRevision) {
      /*
      |--------------------------------------------------------------------------
      | APPROVE REVISION
      |--------------------------------------------------------------------------
      */

      if (action === "approve") {
        try {
          const approvedStory = await db.transaction(
            async (tx) => {
              const reviewedAt = new Date();

              /*
              |--------------------------------------------------------------------------
              | Confirm live story still exists and is published
              |--------------------------------------------------------------------------
              */

              const [currentStory] = await tx
                .select({
                  id: stories.id,
                  authorId: stories.authorId,
                  status: stories.status,
                })
                .from(stories)
                .where(
                  and(
                    eq(stories.id, storyId),
                    eq(stories.isDeleted, false)
                  )
                )
                .limit(1);

              if (!currentStory) {
                throw new Error(
                  "STORY_NOT_FOUND"
                );
              }

              if (
                currentStory.status !==
                "published"
              ) {
                throw new Error(
                  "STORY_NOT_PUBLISHED"
                );
              }

              /*
              |--------------------------------------------------------------------------
              | Prevent slug collision with another story
              |--------------------------------------------------------------------------
              */

              const [slugConflict] = await tx
                .select({
                  id: stories.id,
                })
                .from(stories)
                .where(
                  and(
                    eq(
                      stories.slug,
                      pendingRevision.slug
                    ),
                    ne(
                      stories.id,
                      storyId
                    ),
                    eq(
                      stories.isDeleted,
                      false
                    )
                  )
                )
                .limit(1);

              if (slugConflict) {
                throw new Error(
                  "SLUG_CONFLICT"
                );
              }

              /*
              |--------------------------------------------------------------------------
              | Update the existing live story
              |--------------------------------------------------------------------------
              |
              | The story ID remains unchanged.
              |
              | Therefore existing:
              | - comments
              | - comment likes
              | - story likes
              | - bookmarks
              | - reports
              |
              | remain attached to the same story.
              |--------------------------------------------------------------------------
              */

              const [updatedStory] = await tx
                .update(stories)
                .set({
                  title: pendingRevision.title,
                  slug: pendingRevision.slug,
                  excerpt:
                    pendingRevision.excerpt,
                  content:
                    pendingRevision.content,
                  coverImage:
                    pendingRevision.coverImage,
                  coverImagePublicId:
                    pendingRevision.coverImagePublicId,
                  categoryId:
                    pendingRevision.categoryId,
                  updatedAt: reviewedAt,
                })
                .where(
                  and(
                    eq(stories.id, storyId),
                    eq(
                      stories.status,
                      "published"
                    ),
                    eq(
                      stories.isDeleted,
                      false
                    )
                  )
                )
                .returning({
                  id: stories.id,
                  title: stories.title,
                  slug: stories.slug,
                  authorId: stories.authorId,
                });

              if (!updatedStory) {
                throw new Error(
                  "STORY_UPDATE_FAILED"
                );
              }

              /*
              |--------------------------------------------------------------------------
              | Replace live story images
              |--------------------------------------------------------------------------
              */

              const revisionImages =
                await tx
                  .select({
                    imageUrl:
                      storyRevisionImages.imageUrl,
                    publicId:
                      storyRevisionImages.publicId,
                    caption:
                      storyRevisionImages.caption,
                    displayOrder:
                      storyRevisionImages.displayOrder,
                  })
                  .from(storyRevisionImages)
                  .where(
                    eq(
                      storyRevisionImages.revisionId,
                      pendingRevision.id
                    )
                  )
                  .orderBy(
                    storyRevisionImages.displayOrder
                  );

              await tx
                .delete(storyImages)
                .where(
                  eq(
                    storyImages.storyId,
                    storyId
                  )
                );

              if (revisionImages.length > 0) {
                await tx
                  .insert(storyImages)
                  .values(
                    revisionImages.map(
                      (image) => ({
                        storyId,
                        imageUrl:
                          image.imageUrl,
                        publicId:
                          image.publicId,
                        caption:
                          image.caption,
                        displayOrder:
                          image.displayOrder,
                      })
                    )
                  );
              }

              /*
              |--------------------------------------------------------------------------
              | Mark revision approved
              |--------------------------------------------------------------------------
              */

              await tx
                .update(storyRevisions)
                .set({
                  status: "approved",
                  reviewedAt,
                  reviewerId: user.id,
                  updatedAt: reviewedAt,
                })
                .where(
                  and(
                    eq(
                      storyRevisions.id,
                      pendingRevision.id
                    ),
                    eq(
                      storyRevisions.status,
                      "pending_review"
                    )
                  )
                );

              return updatedStory;
            }
          );

          /*
          |--------------------------------------------------------------------------
          | Notify author
          |--------------------------------------------------------------------------
          */

          try {
            await db
              .insert(notifications)
              .values({
                userId:
                  approvedStory.authorId,
                type: "system",
                message:
                  `Your changes to "${approvedStory.title}" have been approved and published.`,
                link: `/stories/${approvedStory.slug}`,
                storyId:
                  approvedStory.id,
                commentId: null,
                isRead: false,
              });
          } catch (notificationError) {
            console.error(
              "Story update approval notification failed:",
              notificationError
            );
          }

          return NextResponse.json(
            {
              success: true,
              action: "approve",
              submissionType:
                "story_update",
              message:
                "Story update approved and published successfully.",
              story: {
                id: approvedStory.id,
                title:
                  approvedStory.title,
                slug:
                  approvedStory.slug,
              },
            },
            { status: 200 }
          );
        } catch (error) {
          console.error(
            "Story revision approval error:",
            error
          );

          if (
            error instanceof Error &&
            error.message ===
              "STORY_NOT_FOUND"
          ) {
            return NextResponse.json(
              {
                message:
                  "The original published story could not be found.",
              },
              { status: 404 }
            );
          }

          if (
            error instanceof Error &&
            error.message ===
              "STORY_NOT_PUBLISHED"
          ) {
            return NextResponse.json(
              {
                message:
                  "This story is no longer published and cannot be updated through this review.",
              },
              { status: 409 }
            );
          }

          if (
            error instanceof Error &&
            error.message ===
              "SLUG_CONFLICT"
          ) {
            return NextResponse.json(
              {
                message:
                  "The proposed story URL is already being used by another story. Please ask the author to change the title.",
              },
              { status: 409 }
            );
          }

          return NextResponse.json(
            {
              message:
                "Unable to approve this story update. Please try again.",
            },
            { status: 500 }
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | REJECT REVISION
      |--------------------------------------------------------------------------
      */

      const reviewedAt = new Date();

      const [rejectedRevision] = await db
        .update(storyRevisions)
        .set({
          status: "rejected",
          feedback,
          reviewedAt,
          reviewerId: user.id,
          updatedAt: reviewedAt,
        })
        .where(
          and(
            eq(
              storyRevisions.id,
              pendingRevision.id
            ),
            eq(
              storyRevisions.status,
              "pending_review"
            )
          )
        )
        .returning({
          id: storyRevisions.id,
          storyId: storyRevisions.storyId,
          title: storyRevisions.title,
          authorId: storyRevisions.authorId,
        });

      if (!rejectedRevision) {
        return NextResponse.json(
          {
            message:
              "This story update has already been reviewed.",
          },
          { status: 409 }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT:
      | The live published story is NOT modified on rejection.
      |--------------------------------------------------------------------------
      */

      try {
        await db
          .insert(notifications)
          .values({
            userId:
              rejectedRevision.authorId,
            type: "system",
            message:
              `Your changes to "${rejectedRevision.title}" were not approved. Admin feedback: ${feedback}`,
            link: `/users-dashboard/edit-story/${rejectedRevision.storyId}`,
            storyId:
              rejectedRevision.storyId,
            commentId: null,
            isRead: false,
          });
      } catch (notificationError) {
        console.error(
          "Story update rejection notification failed:",
          notificationError
        );
      }

      return NextResponse.json(
        {
          success: true,
          action: "reject",
          submissionType: "story_update",
          message:
            "Story update rejected. The published story remains unchanged.",
          story: {
            id: rejectedRevision.storyId,
            title:
              rejectedRevision.title,
          },
        },
        { status: 200 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NEW STORY SUBMISSION
    |--------------------------------------------------------------------------
    */

    const [pendingStory] = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        authorId: stories.authorId,
        status: stories.status,
      })
      .from(stories)
      .where(
        and(
          eq(stories.id, storyId),
          eq(
            stories.status,
            "pending_review"
          ),
          eq(stories.isDeleted, false)
        )
      )
      .limit(1);

    if (!pendingStory) {
      return NextResponse.json(
        {
          message:
            "Pending story not found or it has already been reviewed.",
        },
        { status: 404 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | APPROVE NEW STORY
    |--------------------------------------------------------------------------
    */

    if (action === "approve") {
      const [approvedStory] = await db
        .update(stories)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(stories.id, storyId),
            eq(
              stories.status,
              "pending_review"
            ),
            eq(stories.isDeleted, false)
          )
        )
        .returning({
          id: stories.id,
          title: stories.title,
          slug: stories.slug,
          authorId: stories.authorId,
        });

      if (!approvedStory) {
        return NextResponse.json(
          {
            message:
              "This story has already been reviewed.",
          },
          { status: 409 }
        );
      }

      try {
        await db
          .insert(notifications)
          .values({
            userId:
              approvedStory.authorId,
            type: "system",
            message:
              `Your story "${approvedStory.title}" has been approved and published.`,
            link: `/stories/${approvedStory.slug}`,
            storyId:
              approvedStory.id,
            commentId: null,
            isRead: false,
          });
      } catch (notificationError) {
        console.error(
          "Story approval notification failed:",
          notificationError
        );
      }

      return NextResponse.json(
        {
          success: true,
          action: "approve",
          submissionType:
            "new_submission",
          message:
            "Story approved and published successfully.",
          story: {
            id: approvedStory.id,
            title:
              approvedStory.title,
            slug:
              approvedStory.slug,
          },
        },
        { status: 200 }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REJECT NEW STORY
    |--------------------------------------------------------------------------
    */

    const [rejectedStory] = await db
      .update(stories)
      .set({
        status: "draft",
        publishedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stories.id, storyId),
          eq(
            stories.status,
            "pending_review"
          ),
          eq(stories.isDeleted, false)
        )
      )
      .returning({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        authorId: stories.authorId,
      });

    if (!rejectedStory) {
      return NextResponse.json(
        {
          message:
            "This story has already been reviewed.",
        },
        { status: 409 }
      );
    }

    try {
      await db
        .insert(notifications)
        .values({
          userId:
            rejectedStory.authorId,
          type: "system",
          message:
            `Your story "${rejectedStory.title}" needs changes before it can be published. Admin feedback: ${feedback}`,
          link: `/users-dashboard/write-story?edit=${encodeURIComponent(
            rejectedStory.id
          )}`,
          storyId:
            rejectedStory.id,
          commentId: null,
          isRead: false,
        });
    } catch (notificationError) {
      console.error(
        "Story rejection notification failed:",
        notificationError
      );
    }

    return NextResponse.json(
      {
        success: true,
        action: "reject",
        submissionType:
          "new_submission",
        message:
          "Story rejected and returned to the author as a draft.",
        story: {
          id: rejectedStory.id,
          title:
            rejectedStory.title,
          slug:
            rejectedStory.slug,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Admin pending review action error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to process the review action. Please try again.",
      },
      { status: 500 }
    );
  }
            }
