import { resumeAnalysis, type ResumeAnalysis, type InsertResumeAnalysis, users, type User, type InsertUser } from "./schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface defines the methods for interacting with the data
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createResumeAnalysis(analysis: InsertResumeAnalysis): Promise<ResumeAnalysis>;
  getResumeAnalysis(id: number): Promise<ResumeAnalysis | undefined>;
  getRecentResumeAnalyses(limit: number): Promise<ResumeAnalysis[]>;
}

// DatabaseStorage implements the IStorage interface using the PostgreSQL database
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createResumeAnalysis(insertAnalysis: InsertResumeAnalysis): Promise<ResumeAnalysis> {
    const [analysis] = await db
      .insert(resumeAnalysis)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getResumeAnalysis(id: number): Promise<ResumeAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(resumeAnalysis)
      .where(eq(resumeAnalysis.id, id));
    return analysis;
  }

  async getRecentResumeAnalyses(limit: number): Promise<ResumeAnalysis[]> {
    return await db
      .select()
      .from(resumeAnalysis)
      .orderBy(desc(resumeAnalysis.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
