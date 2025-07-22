import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).notNull().default("0.00"),
  monthlySpent: decimal("monthly_spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  targetDate: timestamp("target_date"),
  icon: text("icon").notNull().default("fas fa-bullseye"),
  color: text("color").notNull().default("#3B82F6"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  categoryId: true,
  description: true,
  date: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  categoryId: true,
  amount: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  title: true,
  description: true,
  targetAmount: true,
  targetDate: true,
  icon: true,
  color: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type Category = typeof categories.$inferSelect;
