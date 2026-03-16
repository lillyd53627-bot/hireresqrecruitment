import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MetricsCard({ title, value, change, icon: Icon, trend }) {
  const isPositive = trend === 'up';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{title}</p>
          {Icon && (
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-red-600" />
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        {change && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </span>
            <span className="text-sm text-gray-600">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}