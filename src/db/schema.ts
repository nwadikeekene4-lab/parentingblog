import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

/* ===========================
   ENUMS
=========================== */

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "user",
]);

export const storyStatusEnum = pgEnum("story_status", [
  "draft",
  "pending_review",
  "published",
  "archived",
]);

/* ===========================
   USERS
=========================== */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  displayName: varchar("display_name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 255,
  })
    .notNull()
    .unique(),

  passwordHash: text("password_hash").notNull(),

  profileImage: text("profile_image"),

  bio: text("bio"),

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
   CATEGORIES
=========================== */

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),

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
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  slug: varchar("slug", {
    length: 255,
  })
    .notNull()
    .unique(),

  excerpt: text("excerpt"),

  content: text("content").notNull(),

  coverImage: text("cover_image"),

  authorId: uuid("author_id")
    .references(() => users.id)
    .notNull(),

  categoryId: uuid("category_id")
    .references(() => categories.id)
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
  id: uuid("id").defaultRandom().primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id)
    .notNull(),

  imageUrl: text("image_url").notNull(),

  caption: text("caption"),

  displayOrder: integer("display_order")
    .default(0)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

/* ===========================
   COMMENTS
=========================== */

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id)
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  parentCommentId: uuid("parent_comment_id"),

  content: text("content").notNull(),

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

export const storyLikes = pgTable("story_likes", {
  id: uuid("id").defaultRandom().primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id)
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

/* ===========================
   STORY BOOKMARKS
=========================== */

export const storyBookmarks = pgTable("story_bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),

  storyId: uuid("story_id")
    .references(() => stories.id)
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
