import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AddBudgetModal from "@/components/add-budget-modal";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

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

export default function BudgetPage() {
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-32"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-app-secondary">Budget Management</h1>
          </div>
          <Button
            onClick={() => setShowBudgetModal(true)}
            className="bg-app-warning hover:bg-app-warning/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>

        {!budgets || budgets.length === 0 ? (
          <div className="bg-app-surface rounded-2xl p-12 text-center shadow-material">
            <i className="fas fa-chart-pie text-6xl mb-6 text-gray-300"></i>
            <h3 className="text-xl font-semibold mb-2">No Budgets Set</h3>
            <p className="text-gray-500 mb-6">
              Start managing your finances by setting budgets for different categories.
            </p>
            <Button
              onClick={() => setShowBudgetModal(true)}
              className="bg-app-warning hover:bg-app-warning/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const spent = parseFloat(budget.spent);
              const total = parseFloat(budget.amount);
              const percentage = total > 0 ? (spent / total) * 100 : 0;
              const remaining = Math.max(0, total - spent);
              const isOverBudget = spent > total;

              return (
                <div key={budget.id} className="bg-app-surface rounded-2xl p-6 shadow-material">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${budget.category?.color}20` }}
                    >
                      <i 
                        className={`${budget.category?.icon || 'fas fa-question'} text-xl`}
                        style={{ color: budget.category?.color }}
                      ></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{budget.category?.name || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">Monthly Budget</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-gray-600">
                          ${spent.toFixed(2)} / ${total.toFixed(2)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-3 ${isOverBudget ? 'bg-red-100' : ''}`}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className={`font-semibold ${isOverBudget ? 'text-app-error' : 'text-app-success'}`}>
                          {isOverBudget 
                            ? `-$${(spent - total).toFixed(2)}`
                            : `$${remaining.toFixed(2)}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Usage</p>
                        <p className={`font-semibold ${
                          percentage > 90 ? 'text-app-error' : 
                          percentage > 70 ? 'text-app-warning' : 'text-app-success'
                        }`}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {isOverBudget && (
                      <div className="bg-app-error/10 border border-app-error/20 rounded-lg p-3">
                        <p className="text-app-error text-sm font-medium">
                          Over budget by ${(spent - total).toFixed(2)}!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddBudgetModal 
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
        />
      </div>
    </div>
  );
}