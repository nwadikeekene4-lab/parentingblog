import { relations } from "drizzle-orm";

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
   SESSIONS
=========================== */

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
    |--------------------------------------------------------------------------
    | REGISTERED USER IDENTITY
    |--------------------------------------------------------------------------
    |
    | NULL when the comment was made by an anonymous visitor.
    |--------------------------------------------------------------------------
    */

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    /*
    |--------------------------------------------------------------------------
    | ANONYMOUS VISITOR IDENTITY
    |--------------------------------------------------------------------------
    |
    | Generated by the server and stored in a secure visitor cookie.
    |
    | The client must never be trusted to choose this value.
    |--------------------------------------------------------------------------
    */

    guestId: uuid("guest_id"),

    /*
    |--------------------------------------------------------------------------
    | ANONYMOUS DISPLAY NAME
    |--------------------------------------------------------------------------
    |
    | Used when displaying anonymous comments.
    |
    | Example:
    |
    | "Anonymous"
    | "Visitor"
    |
    | The API can decide the actual display name.
    |--------------------------------------------------------------------------
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
    parentCommentFk: foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: "comments_parent_comment_fk",
    }).onDelete("cascade"),

    /*
    |--------------------------------------------------------------------------
    | Every comment must belong to exactly one identity.
    |--------------------------------------------------------------------------
    |
    | Registered user:
    |
    | user_id = value
    | guest_id = NULL
    |
    | Anonymous visitor:
    |
    | user_id = NULL
    | guest_id = value
    |--------------------------------------------------------------------------
    */

    commentIdentityCheck: check(
      "comments_identity_check",
      `
      (
        ("user_id" IS NOT NULL AND "guest_id" IS NULL)
        OR
        ("user_id" IS NULL AND "guest_id" IS NOT NULL)
      )
      `
    ),

    /*
    |--------------------------------------------------------------------------
    | Fast lookup of visitor comments.
    |--------------------------------------------------------------------------
    */

    guestCommentIndex: index(
      "comments_guest_id_idx"
    ).on(table.guestId),

    /*
    |--------------------------------------------------------------------------
    | Fast story comment lookup.
    |--------------------------------------------------------------------------
    */

    storyCommentIndex: index(
      "comments_story_id_idx"
    ).on(table.storyId),

    /*
    |--------------------------------------------------------------------------
    | Fast parent/reply lookup.
    |--------------------------------------------------------------------------
    */

    parentCommentIndex: index(
      "comments_parent_comment_id_idx"
    ).on(table.parentCommentId),
  })
);


/* ===========================
   STORY LIKES
=========================== */

export const storyLikes = pgTable(
  "story_likes",
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
    |--------------------------------------------------------------------------
    | REGISTERED USER
    |--------------------------------------------------------------------------
    |
    | NULL when the like belongs to an anonymous visitor.
    |--------------------------------------------------------------------------
    */

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    /*
    |--------------------------------------------------------------------------
    | ANONYMOUS VISITOR
    |--------------------------------------------------------------------------
    |
    | Generated server-side and stored in a secure visitor cookie.
    |--------------------------------------------------------------------------
    */

    guestId: uuid("guest_id"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({

    /*
    |--------------------------------------------------------------------------
    | A registered user can like a story only once.
    |--------------------------------------------------------------------------
    */

    uniqueUserStoryLike: unique()
      .on(
        table.storyId,
        table.userId
      ),

    /*
    |--------------------------------------------------------------------------
    | A visitor can like a story only once.
    |--------------------------------------------------------------------------
    */

    uniqueGuestStoryLike: unique()
      .on(
        table.storyId,
        table.guestId
      ),

    /*
    |--------------------------------------------------------------------------
    | Every story like must belong to exactly one identity.
    |--------------------------------------------------------------------------
    */

    likeIdentityCheck: check(
      "story_likes_identity_check",
      `
      (
        ("user_id" IS NOT NULL AND "guest_id" IS NULL)
        OR
        ("user_id" IS NULL AND "guest_id" IS NOT NULL)
      )
      `
    ),

    /*
    |--------------------------------------------------------------------------
    | Fast visitor-like lookup.
    |--------------------------------------------------------------------------
    */

    guestLikeIndex: index(
      "story_likes_guest_id_idx"
    ).on(table.guestId),

    /*
    |--------------------------------------------------------------------------
    | Fast story-like lookup.
    |--------------------------------------------------------------------------
    */

    storyLikeIndex: index(
      "story_likes_story_id_idx"
    ).on(table.storyId),

    /*
    |--------------------------------------------------------------------------
    | Fast registered-user lookup.
    |--------------------------------------------------------------------------
    */

    userLikeIndex: index(
      "story_likes_user_id_idx"
    ).on(table.userId),
  })
);


/* ===========================
   COMMENT LIKES
=========================== */

export const commentLikes = pgTable(
  "comment_likes",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    commentId: uuid("comment_id")
      .references(() => comments.id, {
        onDelete: "cascade",
      })
      .notNull(),

    /*
    |--------------------------------------------------------------------------
    | REGISTERED USER
    |--------------------------------------------------------------------------
    |
    | NULL when the like belongs to an anonymous visitor.
    |--------------------------------------------------------------------------
    */

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    /*
    |--------------------------------------------------------------------------
    | ANONYMOUS VISITOR
    |--------------------------------------------------------------------------
    */

    guestId: uuid("guest_id"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({

    /*
    |--------------------------------------------------------------------------
    | A registered user can like a comment only once.
    |--------------------------------------------------------------------------
    */

    uniqueUserCommentLike: unique()
      .on(
        table.commentId,
        table.userId
      ),

    /*
    |--------------------------------------------------------------------------
    | An anonymous visitor can like a comment only once.
    |--------------------------------------------------------------------------
    */

    uniqueGuestCommentLike: unique()
      .on(
        table.commentId,
        table.guestId
      ),

    /*
    |--------------------------------------------------------------------------
    | Every comment like must belong to exactly one identity.
    |--------------------------------------------------------------------------
    */

    likeIdentityCheck: check(
      "comment_likes_identity_check",
      `
      (
        ("user_id" IS NOT NULL AND "guest_id" IS NULL)
        OR
        ("user_id" IS NULL AND "guest_id" IS NOT NULL)
      )
      `
    ),

    /*
    |--------------------------------------------------------------------------
    | Fast visitor comment-like lookup.
    |--------------------------------------------------------------------------
    */

    guestCommentLikeIndex: index(
      "comment_likes_guest_id_idx"
    ).on(table.guestId),

    /*
    |--------------------------------------------------------------------------
    | Fast comment-like lookup.
    |--------------------------------------------------------------------------
    */

    commentLikeIndex: index(
      "comment_likes_comment_id_idx"
    ).on(table.commentId),

    /*
    |--------------------------------------------------------------------------
    | Fast registered-user lookup.
    |--------------------------------------------------------------------------
    */

    userCommentLikeIndex: index(
      "comment_likes_user_id_idx"
    ).on(table.userId),
  })
);
/* ===========================
   BOOKMARKS
=========================== */

export const storyBookmarks = pgTable(
  "story_bookmarks",
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
    |--------------------------------------------------------------------------
    | BOOKMARKS ARE AVAILABLE ONLY TO REGISTERED USERS
    |--------------------------------------------------------------------------
    |
    | Anonymous visitors can read, comment, reply and like.
    | Bookmarks remain a registered-user feature.
    |--------------------------------------------------------------------------
    */

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({
    uniqueBookmark: unique()
      .on(
        table.storyId,
        table.userId
      ),

    bookmarkUserIndex: index(
      "story_bookmarks_user_id_idx"
    ).on(table.userId),

    bookmarkStoryIndex: index(
      "story_bookmarks_story_id_idx"
    ).on(table.storyId),
  })
);


/* ===========================
   NOTIFICATIONS
=========================== */

export const notifications = pgTable(
  "notifications",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION RECIPIENT
    |--------------------------------------------------------------------------
    |
    | Notifications belong to registered users.
    |
    | Anonymous visitors can perform comments/likes, but they do not
    | have an account to receive notifications.
    |--------------------------------------------------------------------------
    */

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    type: notificationTypeEnum("type")
      .notNull(),

    message: text("message")
      .notNull(),

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATION DESTINATION
    |--------------------------------------------------------------------------
    */

    link: text("link"),

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL STORY REFERENCE
    |--------------------------------------------------------------------------
    */

    storyId: uuid("story_id")
      .references(() => stories.id, {
        onDelete: "cascade",
      }),

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL COMMENT REFERENCE
    |--------------------------------------------------------------------------
    */

    commentId: uuid("comment_id")
      .references(() => comments.id, {
        onDelete: "cascade",
      }),

    isRead: boolean("is_read")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({
    notificationUserIndex: index(
      "notifications_user_id_idx"
    ).on(table.userId),

    notificationCreatedAtIndex: index(
      "notifications_created_at_idx"
    ).on(table.createdAt),
  })
);


/* ===========================
   USER ACTIVITIES
=========================== */

export const userActivities = pgTable(
  "user_activities",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    type: activityTypeEnum("type")
      .notNull(),

    message: text("message")
      .notNull(),

    storyId: uuid("story_id")
      .references(() => stories.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({
    userActivityUserIndex: index(
      "user_activities_user_id_idx"
    ).on(table.userId),

    userActivityCreatedAtIndex: index(
      "user_activities_created_at_idx"
    ).on(table.createdAt),
  })
);


/* ===========================
   REPORTS
=========================== */

export const reports = pgTable(
  "reports",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    reporterId: uuid("reporter_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    storyId: uuid("story_id")
      .references(() => stories.id, {
        onDelete: "cascade",
      }),

    commentId: uuid("comment_id")
      .references(() => comments.id, {
        onDelete: "cascade",
      }),

    reason: text("reason")
      .notNull(),

    status: reportStatusEnum("status")
      .default("pending")
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({
    reportReporterIndex: index(
      "reports_reporter_id_idx"
    ).on(table.reporterId),

    reportStoryIndex: index(
      "reports_story_id_idx"
    ).on(table.storyId),

    reportCommentIndex: index(
      "reports_comment_id_idx"
    ).on(table.commentId),
  })
);


/* ===========================
   CONTACT MESSAGES
=========================== */

export const contactMessages = pgTable(
  "contact_messages",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    email: varchar("email", {
      length: 255,
    }).notNull(),

    message: text("message")
      .notNull(),

    isRead: boolean("is_read")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

  },
  (table) => ({
    contactCreatedAtIndex: index(
      "contact_messages_created_at_idx"
    ).on(table.createdAt),

    contactIsReadIndex: index(
      "contact_messages_is_read_idx"
    ).on(table.isRead),
  })
);


/* ===========================
   NEWSLETTER SUBSCRIBERS
=========================== */

export const newsletterSubscribers =
  pgTable(
    "newsletter_subscribers",
    {

      id: uuid("id")
        .defaultRandom()
        .primaryKey(),

      email: varchar("email", {
        length: 255,
      })
        .notNull()
        .unique(),

      isVerified: boolean("is_verified")
        .default(false)
        .notNull(),

      createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    },
    (table) => ({
      newsletterCreatedAtIndex: index(
        "newsletter_subscribers_created_at_idx"
      ).on(table.createdAt),
    })
  );


/* ===========================
   EMAIL VERIFICATION TOKENS
=========================== */

export const emailVerificationTokens =
  pgTable(
    "email_verification_tokens",
    {

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

    },
    (table) => ({
      emailVerificationUserIndex: index(
        "email_verification_tokens_user_id_idx"
      ).on(table.userId),

      emailVerificationExpiryIndex: index(
        "email_verification_tokens_expires_at_idx"
      ).on(table.expiresAt),
    })
  );


/* ===========================
   PASSWORD RESET TOKENS
=========================== */

export const passwordResetTokens =
  pgTable(
    "password_reset_tokens",
    {

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

    },
    (table) => ({
      passwordResetUserIndex: index(
        "password_reset_tokens_user_id_idx"
      ).on(table.userId),

      passwordResetExpiryIndex: index(
        "password_reset_tokens_expires_at_idx"
      ).on(table.expiresAt),
    })
  );


/* ===========================
   RELATIONS
=========================== */


/* USERS */

export const usersRelations = relations(
  users,
  ({ many }) => ({

    stories: many(stories),

    comments: many(comments),

    storyLikes: many(storyLikes),

    commentLikes: many(commentLikes),

    bookmarks: many(storyBookmarks),

    notifications: many(notifications),

    activities: many(userActivities),

    reports: many(reports),

    emailTokens: many(
      emailVerificationTokens
    ),

    passwordResetTokens: many(
      passwordResetTokens
    ),

  })
);


/* USER ACTIVITIES */

export const userActivitiesRelations =
  relations(
    userActivities,
    ({ one }) => ({

      user: one(users, {
        fields: [
          userActivities.userId,
        ],
        references: [users.id],
      }),

      story: one(stories, {
        fields: [
          userActivities.storyId,
        ],
        references: [stories.id],
      }),

    })
  );


/* CATEGORIES */

export const categoriesRelations =
  relations(
    categories,
    ({ many }) => ({

      stories: many(stories),

    })
  );


/* STORIES */

export const storiesRelations =
  relations(
    stories,
    ({ one, many }) => ({

      author: one(users, {
        fields: [stories.authorId],
        references: [users.id],
      }),

      category: one(categories, {
        fields: [stories.categoryId],
        references: [categories.id],
      }),

      images: many(storyImages),

      comments: many(comments),

      likes: many(storyLikes),

      bookmarks: many(storyBookmarks),

      tags: many(storyTags),

      reports: many(reports),

    })
  );


/* EMAIL VERIFICATION TOKENS */

export const emailVerificationTokensRelations =
  relations(
    emailVerificationTokens,
    ({ one }) => ({

      user: one(users, {
        fields: [
          emailVerificationTokens.userId,
        ],
        references: [users.id],
      }),

    })
  );


/* STORY IMAGES */

export const storyImagesRelations =
  relations(
    storyImages,
    ({ one }) => ({

      story: one(stories, {
        fields: [storyImages.storyId],
        references: [stories.id],
      }),

    })
  );


/* COMMENTS */

export const commentsRelations =
  relations(
    comments,
    ({ one, many }) => ({

      story: one(stories, {
        fields: [comments.storyId],
        references: [stories.id],
      }),

      /*
      |--------------------------------------------------------------------------
      | Registered comment author
      |--------------------------------------------------------------------------
      |
      | This is optional because anonymous visitors can comment.
      |--------------------------------------------------------------------------
      */

      user: one(users, {
        fields: [comments.userId],
        references: [users.id],
      }),

      parent: one(comments, {
        fields: [
          comments.parentCommentId,
        ],
        references: [comments.id],
      }),

      replies: many(comments),

      likes: many(commentLikes),

    })
  );


/* STORY LIKES */

export const storyLikesRelations =
  relations(
    storyLikes,
    ({ one }) => ({

      story: one(stories, {
        fields: [storyLikes.storyId],
        references: [stories.id],
      }),

      user: one(users, {
        fields: [storyLikes.userId],
        references: [users.id],
      }),

    })
  );


/* COMMENT LIKES */

export const commentLikesRelations =
  relations(
    commentLikes,
    ({ one }) => ({

      comment: one(comments, {
        fields: [commentLikes.commentId],
        references: [comments.id],
      }),

      user: one(users, {
        fields: [commentLikes.userId],
        references: [users.id],
      }),

    })
  );


/* BOOKMARKS */

export const bookmarksRelations =
  relations(
    storyBookmarks,
    ({ one }) => ({

      story: one(stories, {
        fields: [storyBookmarks.storyId],
        references: [stories.id],
      }),

      user: one(users, {
        fields: [storyBookmarks.userId],
        references: [users.id],
      }),

    })
  );


/* PASSWORD RESET TOKENS */

export const passwordResetTokensRelations =
  relations(
    passwordResetTokens,
    ({ one }) => ({

      user: one(users, {
        fields: [
          passwordResetTokens.userId,
        ],
        references: [users.id],
      }),

    })
  );
