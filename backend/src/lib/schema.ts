import { pgTable, serial, text, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio:          text("bio"),
  address:      text("address"),
  profilePhoto: text("profile_photo"),
  skills:       text("skills").array().default([]),
  rating:       numeric("rating", { precision: 3, scale: 1 }),
  isVerified:   boolean("is_verified").default(false),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skillsTable = pgTable("skills", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  category:    text("category").notNull(),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const requestsTable = pgTable("requests", {
  id:         serial("id").primaryKey(),
  senderId:   integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  skillId:    integer("skill_id").references(() => skillsTable.id, { onDelete: "set null" }),
  message:    text("message"),
  status:     text("status").notNull().default("pending"),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id:         serial("id").primaryKey(),
  senderId:   integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  content:    text("content").notNull(),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
