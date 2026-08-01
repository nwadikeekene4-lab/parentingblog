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

export const comments = pgTable("comments", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id, {
      onDelete: "cascade",
    })
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

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

});


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
    uniqueStoryLike: unique()
      .on(
        table.storyId,
        table.userId
      ),
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
    uniqueCommentLike: unique()
      .on(
        table.commentId,
        table.userId
      ),
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
  })
);

/* ===========================
   NOTIFICATIONS
=========================== */

export const notifications = pgTable("notifications", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  type: notificationTypeEnum("type")
    .notNull(),

  message: text("message")
    .notNull(),

  isRead: boolean("is_read")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

});


/* ===========================
   REPORTS
=========================== */

export const reports = pgTable("reports", {

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

});


/* ===========================
   CONTACT MESSAGES
=========================== */

export const contactMessages = pgTable("contact_messages", {

  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  name: varchar("name", {
    length: 100,
  })
    .notNull(),

  email: varchar("email", {
    length: 255,
  })
    .notNull(),

  message: text("message")
    .notNull(),

  isRead: boolean("is_read")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

});


/* ===========================
   NEWSLETTER SUBSCRIBERS
=========================== */

export const newsletterSubscribers = pgTable(
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

  }
);


/* ===========================
   EMAIL VERIFICATION TOKENS
=========================== */

export const emailVerificationTokens = pgTable(
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

  }
);


/* ===========================
   PASSWORD RESET TOKENS
=========================== */

export const passwordResetTokens = pgTable(
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

  }
);

/* ===========================
   RELATIONS
=========================== */


/* USERS */

export const usersRelations = relations(users, ({ many }) => ({
  stories: many(stories),
  comments: many(comments),
  storyLikes: many(storyLikes),
  commentLikes: many(commentLikes),
  bookmarks: many(storyBookmarks),
  notifications: many(notifications),
  reports: many(reports),
  emailTokens: many(emailVerificationTokens),
  passwordResetTokens: many(passwordResetTokens),
}));


/* CATEGORIES */

export const categoriesRelations = relations(
  categories,
  ({ many }) => ({
    stories: many(stories),
  })
);


/* STORIES */

export const storiesRelations = relations(
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

export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.id],
    }),
  })
);

/* STORY IMAGES */

export const storyImagesRelations = relations(
  storyImages,
  ({ one }) => ({
    story: one(stories, {
      fields: [storyImages.storyId],
      references: [stories.id],
    }),
  })
);


/* COMMENTS */

export const commentsRelations = relations(
  comments,
  ({ one, many }) => ({

    story: one(stories, {
      fields: [comments.storyId],
      references: [stories.id],
    }),

    user: one(users, {
      fields: [comments.userId],
      references: [users.id],
    }),

    parent: one(comments, {
      fields: [comments.parentCommentId],
      references: [comments.id],
    }),

    replies: many(comments),

    likes: many(commentLikes),

  })
);


/* STORY LIKES */

export const storyLikesRelations = relations(
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

export const commentLikesRelations = relations(
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

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);

/* BOOKMARKS */

export const bookmarksRelations = relations(
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
export const storyTagsRelations = relations(
  storyTags,
  ({ one }) => ({

    story: one(stories, {
      fields: [storyTags.storyId],
      references: [stories.id],
    }),

    tag: one(tags, {
      fields: [storyTags.tagId],
      references: [tags.id],
    }),

  })
);

export const tagsRelations = relations(
  tags,
  ({ many }) => ({

    stories: many(storyTags),

  })
);
