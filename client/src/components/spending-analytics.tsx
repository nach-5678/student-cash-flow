import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Chart: any;
  }
}

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

export default function SpendingAnalytics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const { data: analytics, isLoading } = useQuery<AnalyticsData[]>({
    queryKey: ["/api/analytics/spending"],
  });

  useEffect(() => {
    // Load Chart.js if not already loaded
    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        if (analytics && chartRef.current) {
          createChart();
        }
      };
      document.head.appendChild(script);
    } else if (analytics && chartRef.current) {
      createChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analytics]);

  const createChart = () => {
    if (!chartRef.current || !analytics) return;

    const ctx = chartRef.current.getContext('2d');
    
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: analytics.map((item) => item.category?.name || 'Other'),
        datasets: [{
          data: analytics.map((item) => item.percentage),
          backgroundColor: analytics.map((item) => item.category?.color || '#9E9E9E'),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '60%'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-app-surface rounded-2xl p-6 shadow-material">
        <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
        <div className="relative animate-pulse">
          <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app-surface rounded-2xl p-6 shadow-material">
      <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
      
      {!analytics || analytics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-chart-pie text-4xl mb-4 text-gray-300"></i>
          <p>No spending data yet. Make some purchases to see your breakdown!</p>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <canvas ref={chartRef} width="200" height="200"></canvas>
          </div>
          <div className="space-y-2">
            {analytics.map((item, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.category?.color || '#9E9E9E' }}
                  ></div>
                  <span>{item.category?.name || 'Other'}</span>
                </div>
                <span className="font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
