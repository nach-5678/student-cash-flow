import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/app-header";
import BalanceOverview from "@/components/balance-overview";
import QuickActions from "@/components/quick-actions";
import BudgetTracking from "@/components/budget-tracking";
import RecentTransactions from "@/components/recent-transactions";
import SpendingAnalytics from "@/components/spending-analytics";
import MonthlyInsights from "@/components/monthly-insights";
import GoalsTracking from "@/components/goals-tracking";
import SpendingTrends from "@/components/spending-trends";
import AddExpenseModal from "@/components/add-expense-modal";
import AddIncomeModal from "@/components/add-income-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center">
        <div className="text-lg text-app-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-background">
      <AppHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 sm:pb-6">
        <BalanceOverview user={user} />
        
        <QuickActions 
          onAddExpense={() => setShowExpenseModal(true)}
          onAddIncome={() => setShowIncomeModal(true)}
        />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BudgetTracking />
            <RecentTransactions />
          </div>
          
          <div className="space-y-6">
            <SpendingAnalytics />
            <GoalsTracking />
            <SpendingTrends />
            <MonthlyInsights />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowExpenseModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-material-lg hover:shadow-xl hover:scale-105 transition-all z-40 bg-app-primary hover:bg-app-primary/90 sm:hidden"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-app-surface border-t border-gray-200 px-4 py-2 z-30 sm:hidden">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 px-3 text-app-primary">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button 
            onClick={() => window.location.href = "/analytics"}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <i className="fas fa-chart-line text-lg mb-1"></i>
            <span className="text-xs">Analytics</span>
          </button>
          <button 
            onClick={() => window.location.href = "/transactions"}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <i className="fas fa-list text-lg mb-1"></i>
            <span className="text-xs">History</span>
          </button>
          <button 
            onClick={() => window.location.href = "/budgets"}
            className="flex flex-col items-center py-2 px-3 text-gray-400"
          >
            <i className="fas fa-chart-pie text-lg mb-1"></i>
            <span className="text-xs">Budgets</span>
          </button>
        </div>
      </nav>

      <AddExpenseModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
      
      <AddIncomeModal 
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
      />
    </div>
  );
}
