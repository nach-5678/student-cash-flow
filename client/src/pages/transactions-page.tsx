import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import AddExpenseModal from "@/components/add-expense-modal";
import AddIncomeModal from "@/components/add-income-modal";

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

type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || transaction.categoryId.toString() === filterCategory;
    const matchesType = filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
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
            <h1 className="text-2xl font-bold text-app-secondary">All Transactions</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowExpenseModal(true)}
              variant="outline"
              size="sm"
            >
              Add Expense
            </Button>
            <Button
              onClick={() => setShowIncomeModal(true)}
              className="bg-app-success hover:bg-app-success/90"
              size="sm"
            >
              Add Income
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-app-surface rounded-xl p-4 mb-6 shadow-material">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <i className={category.icon} style={{ color: category.color }}></i>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-app-surface rounded-2xl p-12 text-center shadow-material">
            <i className="fas fa-receipt text-6xl mb-6 text-gray-300"></i>
            <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory !== "all" || filterType !== "all" 
                ? "Try adjusting your filters to see more results."
                : "Start by adding your first transaction."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayTransactions]) => (
                <div key={date} className="bg-app-surface rounded-xl p-4 shadow-material">
                  <h3 className="font-semibold text-app-secondary mb-4">
                    {formatDistanceToNow(new Date(date), { addSuffix: true })}
                  </h3>
                  <div className="space-y-2">
                    {dayTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-app-success/10' : 'bg-app-error/10'
                          }`}>
                            <i className={`${transaction.category?.icon || 'fas fa-question'} ${
                              transaction.type === 'income' ? 'text-app-success' : 'text-app-error'
                            }`}></i>
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.category?.name || 'Other'}
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
                </div>
              ))}
          </div>
        )}

        <AddExpenseModal 
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
        />
        
        <AddIncomeModal 
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
        />
      </div>
    </div>
  );
}