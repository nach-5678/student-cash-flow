import { Button } from "@/components/ui/button";
import { Minus, Plus, PieChart, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface QuickActionsProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export default function QuickActions({ onAddExpense, onAddIncome }: QuickActionsProps) {
  const [, setLocation] = useLocation();
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Button
          onClick={onAddExpense}
          variant="outline"
          className="bg-app-surface rounded-xl p-4 h-auto shadow-material hover:shadow-material-lg transition-all hover:-translate-y-1 flex-col space-y-2"
        >
          <div className="w-12 h-12 bg-app-error/10 rounded-full flex items-center justify-center">
            <Minus className="text-app-error text-lg" />
          </div>
          <div className="text-sm font-medium">Add Expense</div>
        </Button>
        
        <Button
          onClick={onAddIncome}
          variant="outline"
          className="bg-app-surface rounded-xl p-4 h-auto shadow-material hover:shadow-material-lg transition-all hover:-translate-y-1 flex-col space-y-2"
        >
          <div className="w-12 h-12 bg-app-success/10 rounded-full flex items-center justify-center">
            <Plus className="text-app-success text-lg" />
          </div>
          <div className="text-sm font-medium">Add Income</div>
        </Button>
        
        <Button
          onClick={() => setLocation("/budgets")}
          variant="outline"
          className="bg-app-surface rounded-xl p-4 h-auto shadow-material hover:shadow-material-lg transition-all hover:-translate-y-1 flex-col space-y-2"
        >
          <div className="w-12 h-12 bg-app-warning/10 rounded-full flex items-center justify-center">
            <PieChart className="text-app-warning text-lg" />
          </div>
          <div className="text-sm font-medium">Budgets</div>
        </Button>
        
        <Button
          onClick={() => setLocation("/analytics")}
          variant="outline"
          className="bg-app-surface rounded-xl p-4 h-auto shadow-material hover:shadow-material-lg transition-all hover:-translate-y-1 flex-col space-y-2"
        >
          <div className="w-12 h-12 bg-app-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="text-app-primary text-lg" />
          </div>
          <div className="text-sm font-medium">Analytics</div>
        </Button>
      </div>
    </div>
  );
}