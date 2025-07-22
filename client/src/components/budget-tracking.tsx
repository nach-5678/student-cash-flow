import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

type Budget = {
  id: number;
  userId: number;
  categoryId: number;
  amount: string;
  spent: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
};

export default function BudgetTracking() {
  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  if (isLoading) {
    return (
      <div className="bg-app-surface rounded-2xl p-6 shadow-material">
        <h3 className="text-lg font-semibold mb-4">Budget Tracking</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-surface rounded-2xl p-6 shadow-material">
      <h3 className="text-lg font-semibold mb-4">Budget Tracking</h3>
      
      {!budgets || budgets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-chart-pie text-4xl mb-4 text-gray-300"></i>
          <p>No budgets set yet. Create your first budget to start tracking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const spent = parseFloat(budget.spent);
            const total = parseFloat(budget.amount);
            const percentage = total > 0 ? (spent / total) * 100 : 0;
            const remaining = Math.max(0, total - spent);
            const isOverBudget = spent > total;
            
            return (
              <div key={budget.id} className="budget-item">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <i className={`${budget.category?.icon || 'fas fa-question'} text-app-warning`}></i>
                    <span className="font-medium">{budget.category?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ${spent.toFixed(2)} / ${total.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2 mb-1"
                />
                <div className={`text-xs mt-1 ${isOverBudget ? 'text-app-error' : 'text-gray-500'}`}>
                  {isOverBudget 
                    ? `$${(spent - total).toFixed(2)} over budget!`
                    : `$${remaining.toFixed(2)} remaining`
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
