import { db } from "./db";
import { users, categories, transactions, budgets, goals } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data
    await db.delete(goals);
    await db.delete(budgets);
    await db.delete(transactions);
    await db.delete(users);
    await db.delete(categories);

    // Insert categories
    const categoryData = [
      { id: 1, name: "Food & Dining", icon: "fas fa-utensils", color: "#F59E0B" },
      { id: 2, name: "Transportation", icon: "fas fa-car", color: "#3B82F6" },
      { id: 3, name: "Entertainment", icon: "fas fa-film", color: "#8B5CF6" },
      { id: 4, name: "Shopping", icon: "fas fa-shopping-bag", color: "#EF4444" },
      { id: 5, name: "Education", icon: "fas fa-graduation-cap", color: "#10B981" },
      { id: 6, name: "Income", icon: "fas fa-dollar-sign", color: "#059669" },
    ];

    await db.insert(categories).values(categoryData);

    // Insert sample user
    const [sampleUser] = await db.insert(users).values({
      username: "student",
      password: "password",
      balance: "847.32",
      monthlyIncome: "1250.00",
      monthlySpent: "402.68"
    }).returning();

    // Insert sample transactions
    const transactionData = [
      {
        userId: sampleUser.id,
        type: "expense" as const,
        amount: "4.85",
        categoryId: 1,
        description: "Coffee",
        date: new Date(Date.now() - 86400000) // yesterday
      },
      {
        userId: sampleUser.id,
        type: "expense" as const,
        amount: "12.50",
        categoryId: 1,
        description: "Lunch",
        date: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        userId: sampleUser.id,
        type: "expense" as const,
        amount: "25.00",
        categoryId: 2,
        description: "Bus Pass",
        date: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        userId: sampleUser.id,
        type: "expense" as const,
        amount: "15.99",
        categoryId: 3,
        description: "Movie Ticket",
        date: new Date(Date.now() - 345600000) // 4 days ago
      },
      {
        userId: sampleUser.id,
        type: "income" as const,
        amount: "150.00",
        categoryId: 6,
        description: "Part-time Job",
        date: new Date(Date.now() - 432000000) // 5 days ago
      }
    ];

    await db.insert(transactions).values(transactionData);

    // Insert sample budget
    await db.insert(budgets).values({
      userId: sampleUser.id,
      categoryId: 1,
      amount: "300.00",
      spent: "89.50"
    });

    // Insert sample goals
    const goalData = [
      {
        userId: sampleUser.id,
        title: "Emergency Fund",
        description: "Build an emergency fund for unexpected expenses",
        targetAmount: "1000.00",
        currentAmount: "150.00",
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        icon: "fas fa-shield-alt",
        color: "#10B981",
        isCompleted: false
      },
      {
        userId: sampleUser.id,
        title: "New Laptop",
        description: "Save money for a new laptop for studies",
        targetAmount: "800.00",
        currentAmount: "0.00",
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        icon: "fas fa-laptop",
        color: "#3B82F6",
        isCompleted: false
      }
    ];

    await db.insert(goals).values(goalData);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };