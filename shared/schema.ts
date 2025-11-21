import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for both students and admins
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  department: text("department"),
  leetcodeUsername: text("leetcode_username"),
  role: text("role").notNull().default("student"), // "student" or "admin"
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["student", "admin"]).default("student"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Stats table - stores LeetCode statistics for each user
export const stats = pgTable("stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  totalSolved: integer("total_solved").notNull().default(0),
  easySolved: integer("easy_solved").notNull().default(0),
  mediumSolved: integer("medium_solved").notNull().default(0),
  hardSolved: integer("hard_solved").notNull().default(0),
  acceptanceRate: text("acceptance_rate"),
  ranking: integer("ranking"),
  contestRating: integer("contest_rating"),
  recentSubmissions: jsonb("recent_submissions").$type<RecentSubmission[]>().default([]),
  badges: jsonb("badges").$type<Badge[]>().default([]),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export type RecentSubmission = {
  title: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
};

export type Badge = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  creationDate: string;
  category: string;
};

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
  lastUpdated: true,
});

export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Stats = typeof stats.$inferSelect;

// Batches table - for grouping students
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchName: text("batch_name").notNull(),
  department: text("department").notNull(),
  rankStart: integer("rank_start"),
  rankEnd: integer("rank_end"),
  studentIds: jsonb("student_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
});

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

// Update LeetCode username schema
export const updateLeetCodeUsernameSchema = z.object({
  leetcodeUsername: z.string().min(1, "LeetCode username is required"),
});

export type UpdateLeetCodeUsername = z.infer<typeof updateLeetCodeUsernameSchema>;

// Admin create user schema - requires LeetCode username
export const adminCreateUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  leetcodeUsername: z.string().min(1, "LeetCode username is required"),
  department: z.string().optional(),
  role: z.enum(["student", "admin"]).default("student"),
});

export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;

// Questions table - stores coding questions created by admins
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sampleInput: text("sample_input").notNull(),
  sampleOutput: text("sample_output").notNull(),
  difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
  testCases: jsonb("test_cases").$type<TestCase[]>().notNull().default([]),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TestCase = {
  input: string;
  expectedOutput: string;
};

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
}).extend({
  difficulty: z.enum(["easy", "medium", "hard"]),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
  })).min(1, "At least one test case is required"),
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Submissions table - stores student submissions for questions
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  language: text("language").notNull(), // "python", "cpp", "java"
  status: text("status").notNull(), // "accepted", "wrong_answer", "runtime_error", "time_limit_exceeded"
  runtime: text("runtime"),
  memory: text("memory"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
}).extend({
  language: z.enum(["python", "cpp", "java"]),
  status: z.enum(["accepted", "wrong_answer", "runtime_error", "time_limit_exceeded", "compilation_error"]),
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
