import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import AddGoalModal from "@/components/add-goal-modal";

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

export default function GoalsTracking() {
  const [showGoalModal, setShowGoalModal] = useState(false);

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  if (isLoading) {
    return (
      <div className="bg-app-surface rounded-2xl p-6 shadow-material">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Financial Goals</h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Goal
          </Button>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Financial Goals</h3>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowGoalModal(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </div>
      
      {!goals || goals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-bullseye text-4xl mb-4 text-gray-300"></i>
          <p>No financial goals set yet. Create your first goal to start saving!</p>
          <Button 
            className="mt-4"
            onClick={() => setShowGoalModal(true)}
          >
            Set Your First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const current = parseFloat(goal.currentAmount);
            const target = parseFloat(goal.targetAmount);
            const percentage = target > 0 ? (current / target) * 100 : 0;
            const remaining = Math.max(0, target - current);
            const daysLeft = goal.targetDate 
              ? Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null;
            
            return (
              <div key={goal.id} className={`goal-item p-4 rounded-lg border ${
                goal.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <i 
                        className={`${goal.icon} text-lg`}
                        style={{ color: goal.color }}
                      ></i>
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-gray-500">{goal.description}</p>
                    </div>
                  </div>
                  {goal.isCompleted && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Completed!
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">
                      ${current.toFixed(2)} / ${target.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {goal.isCompleted 
                        ? "Goal achieved!"
                        : `$${remaining.toFixed(2)} remaining`
                      }
                    </span>
                    {daysLeft !== null && !goal.isCompleted && (
                      <span>
                        {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
                      </span>
                    )}
                  </div>
                </div>

                {!goal.isCompleted && (
                  <div className="mt-3 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        const amount = prompt(`Add money to "${goal.title}"`, "");
                        if (amount && !isNaN(parseFloat(amount))) {
                          const newAmount = (current + parseFloat(amount)).toFixed(2);
                          // You would call the API to update the goal here
                          console.log(`Update goal ${goal.id} to ${newAmount}`);
                        }
                      }}
                    >
                      Add Money
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddGoalModal 
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
      />
    </div>
  );
}