import { 
  users, 
  transactions, 
  budgets, 
  categories,
  goals,
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type Budget,
  type InsertBudget,
  type Goal,
  type InsertGoal,
  type Category
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: string): Promise<void>;
  updateUserMonthlyStats(id: number, income: string, spent: string): Promise<void>;
  
  // Transaction operations
  getTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  getTransactionsByCategory(userId: number, categoryId: number): Promise<Transaction[]>;
  
  // Budget operations
  getBudgetsByUser(userId: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget & { userId: number }): Promise<Budget>;
  updateBudgetSpent(id: number, spent: string): Promise<void>;
  getBudgetByUserAndCategory(userId: number, categoryId: number): Promise<Budget | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  
  // Goal operations
  getGoalsByUser(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal & { userId: number }): Promise<Goal>;
  updateGoalProgress(id: number, currentAmount: string): Promise<void>;
  completeGoal(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private categories: Map<number, Category>;
  private goals: Map<number, Goal>;
  private currentUserId: number;
  private currentTransactionId: number;
  private currentBudgetId: number;
  private currentGoalId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.categories = new Map();
    this.goals = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    this.currentBudgetId = 1;
    this.currentGoalId = 1;
    
    // Initialize default categories
    this.initializeCategories();
    
    // Initialize sample user
    this.initializeSampleUser();
  }

  private initializeCategories() {
    const defaultCategories = [
      { id: 1, name: "Food & Dining", icon: "fas fa-utensils", color: "#F57C00" },
      { id: 2, name: "Textbooks", icon: "fas fa-book", color: "#D32F2F" },
      { id: 3, name: "Transportation", icon: "fas fa-bus", color: "#1976D2" },
      { id: 4, name: "Entertainment", icon: "fas fa-gamepad", color: "#388E3C" },
      { id: 5, name: "Personal Care", icon: "fas fa-heart", color: "#E91E63" },
      { id: 6, name: "Income", icon: "fas fa-briefcase", color: "#388E3C" },
      { id: 7, name: "Other", icon: "fas fa-question", color: "#9E9E9E" },
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  private async initializeSampleUser() {
    const sampleUser = await this.createUser({ username: "student", password: "password" });
    
    // Add sample transactions and budgets
    await this.createTransaction({
      userId: sampleUser.id,
      type: "expense",
      amount: "4.85",
      categoryId: 1,
      description: "Starbucks Coffee",
      date: new Date()
    });

    await this.createTransaction({
      userId: sampleUser.id,
      type: "income",
      amount: "120.00",
      categoryId: 6,
      description: "Part-time Job",
      date: new Date(Date.now() - 86400000) // yesterday
    });

    await this.createBudget({
      userId: sampleUser.id,
      categoryId: 1,
      amount: "300.00"
    });

    // Add sample goals
    await this.createGoal({
      userId: sampleUser.id,
      title: "Emergency Fund",
      description: "Build an emergency fund for unexpected expenses",
      targetAmount: "1000.00",
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      icon: "fas fa-shield-alt",
      color: "#10B981"
    });

    await this.createGoal({
      userId: sampleUser.id,
      title: "New Laptop",
      description: "Save money for a new laptop for studies",
      targetAmount: "800.00",
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      icon: "fas fa-laptop",
      color: "#3B82F6"
    });

    await this.updateGoalProgress(1, "150.00");

    await this.updateUserBalance(sampleUser.id, "847.32");
    await this.updateUserMonthlyStats(sampleUser.id, "1250.00", "402.68");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      balance: "0.00", 
      monthlyIncome: "0.00", 
      monthlySpent: "0.00" 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, balance });
    }
  }

  async updateUserMonthlyStats(id: number, income: string, spent: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.set(id, { ...user, monthlyIncome: income, monthlySpent: spent });
    }
  }

  async getTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      date: transaction.date || new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByCategory(userId: number, categoryId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId && t.categoryId === categoryId);
  }

  async getBudgetsByUser(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => b.userId === userId);
  }

  async createBudget(budget: InsertBudget & { userId: number }): Promise<Budget> {
    const id = this.currentBudgetId++;
    const newBudget: Budget = { ...budget, id, spent: "0.00" };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudgetSpent(id: number, spent: string): Promise<void> {
    const budget = this.budgets.get(id);
    if (budget) {
      this.budgets.set(id, { ...budget, spent });
    }
  }

  async getBudgetByUserAndCategory(userId: number, categoryId: number): Promise<Budget | undefined> {
    return Array.from(this.budgets.values())
      .find(b => b.userId === userId && b.categoryId === categoryId);
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(g => g.userId === userId);
  }

  async createGoal(goal: InsertGoal & { userId: number }): Promise<Goal> {
    const id = this.currentGoalId++;
    const newGoal: Goal = { 
      id,
      userId: goal.userId,
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount,
      currentAmount: "0.00",
      targetDate: goal.targetDate || null,
      icon: goal.icon || "fas fa-bullseye",
      color: goal.color || "#3B82F6",
      isCompleted: false,
      createdAt: new Date()
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoalProgress(id: number, currentAmount: string): Promise<void> {
    const goal = this.goals.get(id);
    if (goal) {
      const targetAmount = parseFloat(goal.targetAmount);
      const current = parseFloat(currentAmount);
      const isCompleted = current >= targetAmount;
      
      this.goals.set(id, { 
        ...goal, 
        currentAmount,
        isCompleted
      });
    }
  }

  async completeGoal(id: number): Promise<void> {
    const goal = this.goals.get(id);
    if (goal) {
      this.goals.set(id, { ...goal, isCompleted: true });
    }
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<void> {
    await db
      .update(users)
      .set({ balance })
      .where(eq(users.id, id));
  }

  async updateUserMonthlyStats(id: number, monthlyIncome: string, monthlySpent: string): Promise<void> {
    await db
      .update(users)
      .set({ monthlyIncome, monthlySpent })
      .where(eq(users.id, id));
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getBudgetsByUser(userId: number): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async createBudget(budget: InsertBudget & { userId: number }): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudgetSpent(id: number, spent: string): Promise<void> {
    await db
      .update(budgets)
      .set({ spent })
      .where(eq(budgets.id, id));
  }

  async getBudgetByUserAndCategory(userId: number, categoryId: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.categoryId, categoryId)));
    return budget || undefined;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
  }

  async createGoal(goal: InsertGoal & { userId: number }): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({
        ...goal,
        currentAmount: "0.00",
        isCompleted: false
      })
      .returning();
    return newGoal;
  }

  async updateGoalProgress(id: number, currentAmount: string): Promise<void> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    if (goal) {
      const targetAmount = parseFloat(goal.targetAmount);
      const current = parseFloat(currentAmount);
      const isCompleted = current >= targetAmount;
      
      await db
        .update(goals)
        .set({ currentAmount, isCompleted })
        .where(eq(goals.id, id));
    }
  }

  async completeGoal(id: number): Promise<void> {
    await db
      .update(goals)
      .set({ isCompleted: true })
      .where(eq(goals.id, id));
  }
}

export const storage = new DatabaseStorage();
