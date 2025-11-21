import { users, stats, batches, questions, submissions, type User, type InsertUser, type Stats, type InsertStats, type Batch, type InsertBatch, type Question, type InsertQuestion, type Submission, type InsertSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByLeetCodeUsername(leetcodeUsername: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Stats operations
  getStatsByUserId(userId: string): Promise<Stats | undefined>;
  upsertStats(stats: InsertStats): Promise<Stats>;
  getAllStats(): Promise<Stats[]>;

  // Batch operations
  getBatch(id: string): Promise<Batch | undefined>;
  getAllBatches(): Promise<Batch[]>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: string, data: Partial<Batch>): Promise<Batch | undefined>;
  deleteBatch(id: string): Promise<boolean>;

  // Question operations
  getQuestion(id: string): Promise<Question | undefined>;
  getAllQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, data: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: string): Promise<boolean>;

  // Submission operations
  getSubmissionsByUserId(userId: string): Promise<Submission[]>;
  getSubmissionsByQuestionId(questionId: string): Promise<Submission[]>;
  getAcceptedSubmissionsByUserId(userId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getUserSolvedQuestions(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByLeetCodeUsername(leetcodeUsername: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.leetcodeUsername, leetcodeUsername));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'student'));
  }

  // Stats operations
  async getStatsByUserId(userId: string): Promise<Stats | undefined> {
    const [stat] = await db.select().from(stats).where(eq(stats.userId, userId));
    return stat || undefined;
  }

  async upsertStats(insertStats: InsertStats): Promise<Stats> {
    const existing = await this.getStatsByUserId(insertStats.userId);
    
    if (existing) {
      const [updated] = await db
        .update(stats)
        .set({ ...insertStats, lastUpdated: new Date() })
        .where(eq(stats.userId, insertStats.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(stats).values(insertStats).returning();
      return created;
    }
  }

  async getAllStats(): Promise<Stats[]> {
    return await db.select().from(stats);
  }

  // Batch operations
  async getBatch(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch || undefined;
  }

  async getAllBatches(): Promise<Batch[]> {
    return await db.select().from(batches).orderBy(desc(batches.createdAt));
  }

  async createBatch(insertBatch: InsertBatch): Promise<Batch> {
    const [batch] = await db.insert(batches).values(insertBatch).returning();
    return batch;
  }

  async updateBatch(id: string, data: Partial<Batch>): Promise<Batch | undefined> {
    const [batch] = await db
      .update(batches)
      .set(data)
      .where(eq(batches.id, id))
      .returning();
    return batch || undefined;
  }

  async deleteBatch(id: string): Promise<boolean> {
    const result = await db.delete(batches).where(eq(batches.id, id));
    return true;
  }

  // Question operations
  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions).orderBy(desc(questions.createdAt));
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async updateQuestion(id: string, data: Partial<Question>): Promise<Question | undefined> {
    const [question] = await db
      .update(questions)
      .set(data)
      .where(eq(questions.id, id))
      .returning();
    return question || undefined;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    await db.delete(questions).where(eq(questions.id, id));
    return true;
  }

  // Submission operations
  async getSubmissionsByUserId(userId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionsByQuestionId(questionId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(eq(submissions.questionId, questionId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getAcceptedSubmissionsByUserId(userId: string): Promise<Submission[]> {
    return await db.select().from(submissions)
      .where(and(
        eq(submissions.userId, userId),
        eq(submissions.status, 'accepted')
      ))
      .orderBy(desc(submissions.submittedAt));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    return submission;
  }

  async getUserSolvedQuestions(userId: string): Promise<string[]> {
    const acceptedSubmissions = await db
      .selectDistinct({ questionId: submissions.questionId })
      .from(submissions)
      .where(and(
        eq(submissions.userId, userId),
        eq(submissions.status, 'accepted')
      ));
    
    return acceptedSubmissions.map(s => s.questionId);
  }
}

export const storage = new DatabaseStorage();
