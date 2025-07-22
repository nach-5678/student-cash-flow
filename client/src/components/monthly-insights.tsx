import { useQuery } from "@tanstack/react-query";

type User = {
  id: number;
  username: string;
  balance: string;
  monthlyIncome: string;
  monthlySpent: string;
};

type AnalyticsData = {
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  amount: number;
  percentage: number;
};

export default function MonthlyInsights() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: analytics } = useQuery<AnalyticsData[]>({
    queryKey: ["/api/analytics/spending"],
  });

  const generateInsights = () => {
    const insights = [];

    if (user && analytics) {
      const monthlySpent = parseFloat(user.monthlySpent);
      const monthlyIncome = parseFloat(user.monthlyIncome);
      
      // Savings rate insight
      if (monthlyIncome > 0) {
        const savingsRate = ((monthlyIncome - monthlySpent) / monthlyIncome) * 100;
        if (savingsRate > 20) {
          insights.push({
            type: 'success',
            icon: 'fas fa-thumbs-up',
            title: 'Great Savings!',
            message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`
          });
        } else if (savingsRate < 10) {
          insights.push({
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            title: 'Low Savings Rate',
            message: `You're only saving ${savingsRate.toFixed(1)}% of your income. Consider reducing expenses.`
          });
        }
      }

      // Spending category insights
      if (analytics.length > 0) {
        const topCategory = analytics[0];
        if (topCategory.percentage > 50) {
          insights.push({
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            title: 'High Spending Alert',
            message: `${topCategory.category?.name} accounts for ${topCategory.percentage}% of your spending.`
          });
        }
      }
    }

    // General tips
    insights.push({
      type: 'info',
      icon: 'fas fa-lightbulb',
      title: 'Money Tip',
      message: 'Consider buying used textbooks or renting them to save money on academic materials.'
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-app-surface rounded-2xl p-6 shadow-material">
      <h3 className="text-lg font-semibold mb-4">Monthly Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              insight.type === 'success' 
                ? 'bg-app-success/5 border-app-success/20' 
                : insight.type === 'warning'
                ? 'bg-app-warning/5 border-app-warning/20'
                : 'bg-app-primary/5 border-app-primary/20'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <i className={`${insight.icon} ${
                insight.type === 'success' 
                  ? 'text-app-success' 
                  : insight.type === 'warning'
                  ? 'text-app-warning'
                  : 'text-app-primary'
              }`}></i>
              <span className={`font-medium ${
                insight.type === 'success' 
                  ? 'text-app-success' 
                  : insight.type === 'warning'
                  ? 'text-app-warning'
                  : 'text-app-primary'
              }`}>
                {insight.title}
              </span>
            </div>
            <p className="text-sm text-gray-600">{insight.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}