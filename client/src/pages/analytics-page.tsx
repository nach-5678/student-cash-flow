import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import SpendingAnalytics from "@/components/spending-analytics";
import MonthlyInsights from "@/components/monthly-insights";

type Transaction = {
  id: number;
  userId: number;
  type: "income" | "expense";
  amount: string;
  categoryId: number;
  description: string;
  date: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
};

type User = {
  id: number;
  username: string;
  balance: string;
  monthlyIncome: string;
  monthlySpent: string;
};

export default function AnalyticsPage() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const calculateStats = () => {
    if (!transactions || !user) return null;

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;

    return {
      totalExpenses,
      totalIncome,
      avgExpense,
      avgIncome,
      transactionCount: transactions.length,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-app-secondary">Financial Analytics</h1>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-app-surface rounded-xl p-4 shadow-material">
              <div className="text-sm text-gray-500 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-app-error">${stats.totalExpenses.toFixed(2)}</div>
            </div>
            <div className="bg-app-surface rounded-xl p-4 shadow-material">
              <div className="text-sm text-gray-500 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-app-success">${stats.totalIncome.toFixed(2)}</div>
            </div>
            <div className="bg-app-surface rounded-xl p-4 shadow-material">
              <div className="text-sm text-gray-500 mb-1">Avg. Expense</div>
              <div className="text-2xl font-bold text-app-warning">${stats.avgExpense.toFixed(2)}</div>
            </div>
            <div className="bg-app-surface rounded-xl p-4 shadow-material">
              <div className="text-sm text-gray-500 mb-1">Savings Rate</div>
              <div className={`text-2xl font-bold ${
                stats.savingsRate > 20 ? 'text-app-success' : 
                stats.savingsRate > 10 ? 'text-app-warning' : 'text-app-error'
              }`}>
                {stats.savingsRate.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <SpendingAnalytics />
          <MonthlyInsights />
        </div>

        {transactions && transactions.length > 0 && (
          <div className="mt-8 bg-app-surface rounded-2xl p-6 shadow-material">
            <h3 className="text-lg font-semibold mb-4">Recent Activity Timeline</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.slice(0, 20).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-app-success/10' : 'bg-app-error/10'
                    }`}>
                      <i className={`${transaction.category?.icon || 'fas fa-question'} text-sm ${
                        transaction.type === 'income' ? 'text-app-success' : 'text-app-error'
                      }`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{transaction.description}</div>
                      <div className="text-xs text-gray-500">
                        {transaction.category?.name} • {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium text-sm ${
                    transaction.type === 'income' ? 'text-app-success' : 'text-app-error'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}