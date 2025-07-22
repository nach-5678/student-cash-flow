interface BalanceOverviewProps {
  user?: {
    balance: string;
    monthlyIncome: string;
    monthlySpent: string;
  };
}

export default function BalanceOverview({ user }: BalanceOverviewProps) {
  const balance = user?.balance ? parseFloat(user.balance) : 0;
  const income = user?.monthlyIncome ? parseFloat(user.monthlyIncome) : 0;
  const spent = user?.monthlySpent ? parseFloat(user.monthlySpent) : 0;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-app-primary to-blue-600 rounded-2xl p-6 text-white shadow-material-lg">
        <h2 className="text-lg font-medium mb-2">Current Balance</h2>
        <div className="text-4xl font-bold mb-4">${balance.toFixed(2)}</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm opacity-90">This Month Income</div>
            <div className="text-xl font-semibold">${income.toFixed(2)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-sm opacity-90">This Month Spent</div>
            <div className="text-xl font-semibold">${spent.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}