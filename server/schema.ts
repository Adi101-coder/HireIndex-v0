import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Resume Analysis schemas
export const resumeAnalysis = pgTable("resume_analysis", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  fileType: text("file_type").notNull(),
  overallScore: integer("overall_score").notNull(),
  keywordsScore: integer("keywords_score").notNull(),
  experienceScore: integer("experience_score").notNull(),
  skillsScore: integer("skills_score").notNull(),
  educationScore: integer("education_score").notNull(),
  formattingScore: integer("formatting_score").notNull(),
  feedback: jsonb("feedback").notNull(),
  improvementSuggestions: jsonb("improvement_suggestions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeAnalysisSchema = createInsertSchema(resumeAnalysis).omit({
  id: true,
  createdAt: true,
});

export type InsertResumeAnalysis = z.infer<typeof insertResumeAnalysisSchema>;
export type ResumeAnalysis = typeof resumeAnalysis.$inferSelect;

// Resume upload schema for validation
export const resumeUploadSchema = z.object({
  file: z.any(),
});

// Resume analysis response schema
export const resumeAnalysisResponseSchema = z.object({
  id: z.number(),
  filename: z.string(),
  fileType: z.string(),
  overallScore: z.number(),
  keywordsScore: z.number(),
  experienceScore: z.number(),
  skillsScore: z.number(),
  educationScore: z.number(),
  formattingScore: z.number(),
  feedback: z.record(z.string(), z.string()),
  improvementSuggestions: z.array(z.string()),
  createdAt: z.string(),
});

export type ResumeAnalysisResponse = z.infer<typeof resumeAnalysisResponseSchema>; 