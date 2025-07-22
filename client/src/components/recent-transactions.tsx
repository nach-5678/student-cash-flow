import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

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

export default function RecentTransactions() {
  const [, setLocation] = useLocation();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions?limit=5");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="bg-app-surface rounded-2xl p-6 shadow-material">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-surface rounded-2xl p-6 shadow-material">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-app-primary"
          onClick={() => setLocation("/transactions")}
        >
          View All
        </Button>
      </div>
      
      {!transactions || transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-receipt text-4xl mb-4 text-gray-300"></i>
          <p>No transactions yet. Add your first expense or income!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-app-success/10' : 'bg-app-warning/10'
                }`}>
                  <i className={`${transaction.category?.icon || 'fas fa-question'} ${
                    transaction.type === 'income' ? 'text-app-success' : 'text-app-warning'
                  }`}></i>
                </div>
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-gray-500">
                    {transaction.category?.name || 'Other'} • {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <div className={`font-medium ${
                transaction.type === 'income' ? 'text-app-success' : 'text-app-error'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}