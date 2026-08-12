import { db } from "@/db";
import { userActivities } from "@/db/schema";

type ActivityType =
  | "profile_display_name_updated"
  | "profile_bio_updated"
  | "profile_country_updated"
  | "profile_state_updated"
  | "profile_image_updated"
  | "story_draft_saved"
  | "story_submitted"
  | "story_edited"
  | "story_published";

type CreateActivityParams = {
  userId: string;
  type: ActivityType;
  message: string;
  storyId?: string;
};

export async function createUserActivity({
  userId,
  type,
  message,
  storyId,
}: CreateActivityParams) {
  await db.insert(userActivities).values({
    userId,
    type,
    message,
    storyId: storyId ?? null,
  });
}
