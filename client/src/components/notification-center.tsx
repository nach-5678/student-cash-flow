import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, X } from "lucide-react";

type User = {
  id: number;
  username: string;
  balance: string;
  monthlyIncome: string;
  monthlySpent: string;
};

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

type Goal = {
  id: number;
  userId: number;
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string | null;
  icon: string;
  color: string;
  isCompleted: boolean;
  createdAt: string;
};

type Notification = {
  id: string;
  type: 'budget_warning' | 'goal_reminder' | 'savings_tip' | 'achievement';
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: Date;
  isRead: boolean;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: budgets } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: goals } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Budget warnings
    if (budgets) {
      budgets.forEach(budget => {
        const spent = parseFloat(budget.spent);
        const total = parseFloat(budget.amount);
        const percentage = total > 0 ? (spent / total) * 100 : 0;

        if (percentage >= 100) {
          newNotifications.push({
            id: `budget-over-${budget.id}`,
            type: 'budget_warning',
            title: 'Budget Exceeded!',
            message: `You've exceeded your ${budget.category?.name} budget by $${(spent - total).toFixed(2)}`,
            icon: 'fas fa-exclamation-triangle',
            color: '#EF4444',
            timestamp: new Date(),
            isRead: false
          });
        } else if (percentage >= 80) {
          newNotifications.push({
            id: `budget-warning-${budget.id}`,
            type: 'budget_warning',
            title: 'Budget Alert',
            message: `You've used ${percentage.toFixed(0)}% of your ${budget.category?.name} budget`,
            icon: 'fas fa-exclamation-circle',
            color: '#F59E0B',
            timestamp: new Date(),
            isRead: false
          });
        }
      });
    }

    // Goal reminders
    if (goals) {
      goals.forEach(goal => {
        if (!goal.isCompleted && goal.targetDate) {
          const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const current = parseFloat(goal.currentAmount);
          const target = parseFloat(goal.targetAmount);
          const progress = (current / target) * 100;

          if (daysLeft <= 7 && progress < 80) {
            newNotifications.push({
              id: `goal-reminder-${goal.id}`,
              type: 'goal_reminder',
              title: 'Goal Deadline Approaching',
              message: `Only ${daysLeft} days left to reach your "${goal.title}" goal!`,
              icon: 'fas fa-clock',
              color: '#F59E0B',
              timestamp: new Date(),
              isRead: false
            });
          }

          if (progress >= 100) {
            newNotifications.push({
              id: `goal-achieved-${goal.id}`,
              type: 'achievement',
              title: 'Goal Achieved! 🎉',
              message: `Congratulations! You've reached your "${goal.title}" goal!`,
              icon: 'fas fa-trophy',
              color: '#10B981',
              timestamp: new Date(),
              isRead: false
            });
          }
        }
      });
    }

    // Savings tips
    if (user) {
      const monthlyIncome = parseFloat(user.monthlyIncome);
      const monthlySpent = parseFloat(user.monthlySpent);
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpent) / monthlyIncome) * 100 : 0;

      if (savingsRate < 10) {
        newNotifications.push({
          id: 'low-savings-tip',
          type: 'savings_tip',
          title: 'Savings Tip',
          message: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
          icon: 'fas fa-lightbulb',
          color: '#3B82F6',
          timestamp: new Date(),
          isRead: false
        });
      }
    }

    return newNotifications;
  };

  useEffect(() => {
    if (user && budgets && goals) {
      const newNotifications = generateNotifications();
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
        return [...prev, ...uniqueNew];
      });
    }
  }, [user, budgets, goals]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b p-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.slice().reverse().map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                      style={{ backgroundColor: `${notification.color}20` }}
                    >
                      <i 
                        className={`${notification.icon} text-sm`}
                        style={{ color: notification.color }}
                      ></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              }}
            >
              Mark all as read
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}