import {
  relations,
  sql,
} from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  unique,
  foreignKey,
  check,
  index,
} from "drizzle-orm/pg-core";


/* ===========================
   ENUMS
=========================== */

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "user",
  "moderator",
]);

export const storyStatusEnum = pgEnum("story_status", [
  "draft",
  "pending_review",
  "published",
  "archived",
]);

// New enum to distinguish submission types for pending-review stories
export const storySubmissionTypeEnum = pgEnum("story_submission_type", [
  "new_submission",
  "story_update",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
  "rejected",
]);

export const notificationTypeEnum = pgEnum(
  "notification_type",
  [
    "comment",
    "reply",
    "like",
    "bookmark",
    "system",
  ]
);

export const activityTypeEnum = pgEnum(
  "activity_type",
  [
    "profile_display_name_updated",
    "profile_bio_updated",
    "profile_country_updated",
    "profile_state_updated",
    "profile_image_updated",
    "story_draft_saved",
    "story_submitted",
    "story_edited",
    "story_published",
  ]
);


/* ===========================
   USERS
=========================== */

export const users = pgTable("users", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  displayName: varchar("display_name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  passwordHash: text("password_hash")
    .notNull(),

  profileImage: text("profile_image"),

  bio: text("bio"),

  country: varchar("country", {
    length: 100,
  }),

  state: varchar("state", {
    length: 100,
  }),

  role: userRoleEnum("role")
    .default("user")
    .notNull(),

  emailVerified: boolean("email_verified")
    .default(false)
    .notNull(),

  emailNotifications: boolean("email_notifications")
    .default(true)
    .notNull(),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});
export const sessions = pgTable("sessions", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  token: text("token")
    .notNull()
    .unique(),

  expiresAt: timestamp("expires_at")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


/* ===========================
   CATEGORIES
=========================== */

export const categories = pgTable("categories", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  slug: varchar("slug", {
    length: 120,
  })
    .notNull()
    .unique(),

  description: text("description"),

  image: text("image"),

  displayOrder: integer("display_order")
    .default(0)
    .notNull(),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});


/* ===========================
   STORIES
=========================== */

export const stories = pgTable("stories", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  slug: varchar("slug", {
    length: 255,
  })
    .notNull()
    .unique(),

  excerpt: text("excerpt"),

  content: text("content")
    .notNull(),

  coverImage: text("cover_image"),

 coverImagePublicId: text(
   "cover_image_public_id"
 ),

  authorId: uuid("author_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  categoryId: uuid("category_id")
    .references(() => categories.id, {
      onDelete: "restrict",
    })
    .notNull(),

  status: storyStatusEnum("status")
    .default("draft")
    .notNull(),

  submissionType: storySubmissionTypeEnum("submission_type")
    .default("new_submission")
    .notNull(),

  featured: boolean("featured")
    .default(false)
    .notNull(),

  views: integer("views")
    .default(0)
    .notNull(),

  isDeleted: boolean("is_deleted")
    .default(false)
    .notNull(),

  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

});


/* ===========================
   STORY IMAGES
=========================== */

export const storyImages = pgTable("story_images", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id, {
      onDelete: "cascade",
    })
    .notNull(),

  imageUrl: text("image_url")
  .notNull(),

 publicId: text("public_id")
   .notNull(),

 caption: text("caption"),

  displayOrder: integer("display_order")
    .default(0)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

});


/* ===========================
   TAGS
=========================== */

export const tags = pgTable("tags", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  name: varchar("name", {
    length: 100,
  })
    .notNull()
    .unique(),

  slug: varchar("slug", {
    length: 120,
  })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

});


/* ===========================
   STORY TAGS
=========================== */

export const storyTags = pgTable(
  "story_tags",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storyId: uuid("story_id")
      .references(() => stories.id, {
        onDelete: "cascade",
      })
      .notNull(),

    tagId: uuid("tag_id")
      .references(() => tags.id, {
        onDelete: "cascade",
      })
      .notNull(),

  },
  (table) => ({
    uniqueStoryTag: unique()
      .on(
        table.storyId,
        table.tagId
      ),
  })
);

/* ===========================
   COMMENTS
=========================== */

export const comments = pgTable(
  "comments",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    storyId: uuid("story_id")
      .references(() => stories.id, {
        onDelete: "cascade",
      })
      .notNull(),

    /*
    --------------------------------------------------------------------------
    |
    | REGISTERED USER
    --------------------------------------------------------------------------
    |
    | NULL when the comment was made by an anonymous visitor.
    --------------------------------------------------------------------------
    */

    userId: uuid("user_id")
  .references(() => users.id, {
    onDelete: "set null",
  }),

anonymousName: varchar("anonymous_name", {
  length: 100,
}),
    /*
    --------------------------------------------------------------------------
    | ANONYMOUS VISITOR
    --------------------------------------------------------------------------
    |
    | Generated by the server and stored in a secure visitor cookie.
    --------------------------------------------------------------------------
    */

    guestId: uuid("guest_id"),

    /*
    --------------------------------------------------------------------------
    | ANONYMOUS DISPLAY NAME
    --------------------------------------------------------------------------
    */

    guestName: varchar("guest_name", {
      length: 100,
    }),

    parentCommentId: uuid("parent_comment_id"),

    content: text("content")
      .notNull(),

    isApproved: boolean("is_approved")
      .default(true)
      .notNull(),

    isDeleted: boolean("is_deleted")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({

    /*
    --------------------------------------------------------------------------
    |
    | SELF-REFERENCING REPLY
    --------------------------------------------------------------------------
    */

    parentCommentFk: foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: "comments_parent_comment_fk",
    }).onDelete("cascade"),

    /*
    --------------------------------------------------------------------------
    | A comment must belong to exactly ONE identity.
    --------------------------------------------------------------------------
    |
    | Registered:
    | userId = value
    | guestId = NULL
    |
    | Visitor:
    | userId = NULL
    | guestId = value
    --------------------------------------------------------------------------
    */

    commentIdentityCheck: check(
  "comments_identity_check",
  sql`
    (
      ("user_id" IS NOT NULL AND "guest_id" IS NULL)
      OR
      ("user_id" IS NULL AND "guest_id" IS NOT NULL)
    )
  `
),

    /*
    --------------------------------------------------------------------------
    |
    | PERFORMANCE INDEXES
    --------------------------------------------------------------------------
    */

    guestCommentIndex: index(
      "comments_guest_id_idx"
    ).on(table.guestId),

    storyCommentIndex: index(
      "comments_story_id_idx"
    ).on(table.storyId),

    parentCommentIndex: index(
      "comments_parent_comment_id_idx"
    ).on(table.parentCommentId),

  })
);
... (truncated for brevity)