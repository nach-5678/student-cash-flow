import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertGoalSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (simplified - in real app would use auth middleware)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const transactions = await storage.getTransactionsByUser(user.id, limit);
      
      // Enrich with category data
      const enrichedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const category = await storage.getCategoryById(transaction.categoryId);
          return { ...transaction, category };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId: user.id
      });

      // Update user balance and monthly stats
      const amount = parseFloat(validatedData.amount);
      const currentBalance = parseFloat(user.balance);
      const currentSpent = parseFloat(user.monthlySpent);
      const currentIncome = parseFloat(user.monthlyIncome);

      if (validatedData.type === "expense") {
        await storage.updateUserBalance(user.id, (currentBalance - amount).toFixed(2));
        await storage.updateUserMonthlyStats(
          user.id, 
          currentIncome.toFixed(2), 
          (currentSpent + amount).toFixed(2)
        );

        // Update budget spent
        const budget = await storage.getBudgetByUserAndCategory(user.id, validatedData.categoryId);
        if (budget) {
          const newSpent = parseFloat(budget.spent) + amount;
          await storage.updateBudgetSpent(budget.id, newSpent.toFixed(2));
        }
      } else {
        await storage.updateUserBalance(user.id, (currentBalance + amount).toFixed(2));
        await storage.updateUserMonthlyStats(
          user.id, 
          (currentIncome + amount).toFixed(2), 
          currentSpent.toFixed(2)
        );
      }

      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Get budgets
  app.get("/api/budgets", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const budgets = await storage.getBudgetsByUser(user.id);
      
      // Enrich with category data
      const enrichedBudgets = await Promise.all(
        budgets.map(async (budget) => {
          const category = await storage.getCategoryById(budget.categoryId);
          return { ...budget, category };
        })
      );

      res.json(enrichedBudgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  // Create budget
  app.post("/api/budgets", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget({
        ...validatedData,
        userId: user.id
      });

      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  // Get spending analytics
  app.get("/api/analytics/spending", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const transactions = await storage.getTransactionsByUser(user.id);
      const expenses = transactions.filter(t => t.type === "expense");
      
      // Group by category
      const categorySpending: Record<number, number> = {};
      for (const expense of expenses) {
        categorySpending[expense.categoryId] = (categorySpending[expense.categoryId] || 0) + parseFloat(expense.amount);
      }

      // Calculate percentages and enrich with category data
      const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
      
      const analytics = await Promise.all(
        Object.entries(categorySpending).map(async ([categoryId, amount]) => {
          const category = await storage.getCategoryById(parseInt(categoryId));
          return {
            category,
            amount,
            percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
          };
        })
      );

      res.json(analytics.sort((a, b) => b.amount - a.amount));
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending analytics" });
    }
  });

  // Get goals
  app.get("/api/goals", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const goals = await storage.getGoalsByUser(user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Create goal
  app.post("/api/goals", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("student");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal({
        ...validatedData,
        userId: user.id
      });

      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  // Update goal progress
  app.patch("/api/goals/:id/progress", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const { amount } = req.body;

      if (!amount || isNaN(parseFloat(amount))) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      await storage.updateGoalProgress(goalId, amount);
      res.json({ message: "Goal progress updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
