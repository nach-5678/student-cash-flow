import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

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

export default function SpendingTrends() {
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const calculateTrends = () => {
    if (!transactions || transactions.length === 0) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentExpenses = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo
    );
    const previousExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      new Date(t.date) >= sixtyDaysAgo && 
      new Date(t.date) < thirtyDaysAgo
    );

    const recentTotal = recentExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const previousTotal = previousExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const change = previousTotal > 0 ? ((recentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Category trends
    const categoryTrends = new Map<number, { name: string; recent: number; previous: number; icon: string; color: string }>();
    
    recentExpenses.forEach(t => {
      if (!categoryTrends.has(t.categoryId)) {
        categoryTrends.set(t.categoryId, {
          name: t.category?.name || 'Other',
          recent: 0,
          previous: 0,
          icon: t.category?.icon || 'fas fa-question',
          color: t.category?.color || '#9E9E9E'
        });
      }
      const trend = categoryTrends.get(t.categoryId)!;
      trend.recent += parseFloat(t.amount);
    });

    previousExpenses.forEach(t => {
      if (!categoryTrends.has(t.categoryId)) {
        categoryTrends.set(t.categoryId, {
          name: t.category?.name || 'Other',
          recent: 0,
          previous: 0,
          icon: t.category?.icon || 'fas fa-question',
          color: t.category?.color || '#9E9E9E'
        });
      }
      const trend = categoryTrends.get(t.categoryId)!;
      trend.previous += parseFloat(t.amount);
    });

    return {
      totalChange: change,
      recentTotal,
      previousTotal,
      categories: Array.from(categoryTrends.values())
        .map(cat => ({
          ...cat,
          change: cat.previous > 0 ? ((cat.recent - cat.previous) / cat.previous) * 100 : 0
        }))
        .filter(cat => cat.recent > 0 || cat.previous > 0)
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    };
  };

  const trends = calculateTrends();

  if (!trends) {
    return (
      <div className="bg-app-surface rounded-2xl p-6 shadow-material">
        <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
        <p className="text-gray-500 text-center py-8">
          Not enough data to show trends. Add more transactions to see insights.
        </p>
      </div>
    );
  }

  const getTrendIcon = (change: number) => {
    if (change > 5) return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (change < -5) return <ArrowDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-red-500';
    if (change < -5) return 'text-green-500';
    return 'text-gray-400';
  };

  return (
    <div className="bg-app-surface rounded-2xl p-6 shadow-material">
      <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
      
      {/* Overall trend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Last 30 Days vs Previous 30 Days</p>
            <p className="text-2xl font-bold">${trends.recentTotal.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getTrendIcon(trends.totalChange)}
            <span className={`font-medium ${getTrendColor(trends.totalChange)}`}>
              {Math.abs(trends.totalChange).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Category trends */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Category Breakdown</h4>
        {trends.categories.slice(0, 5).map((category) => (
          <div key={category.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <i 
                  className={`${category.icon} text-sm`}
                  style={{ color: category.color }}
                ></i>
              </div>
              <div>
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-gray-500">
                  ${category.recent.toFixed(2)} (vs ${category.previous.toFixed(2)})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(category.change)}
              <span className={`text-sm font-medium ${getTrendColor(category.change)}`}>
                {Math.abs(category.change).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {trends.categories.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No category data available for comparison.
        </p>
      )}
    </div>
  );
}