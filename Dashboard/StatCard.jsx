import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, change, changeType, icon: Icon, iconBg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-black mt-2">{value}</p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm font-medium",
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            )}>
              {changeType === 'positive' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconBg || "bg-red-50"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            iconBg?.includes('red') ? 'text-red-600' : 
            iconBg?.includes('blue') ? 'text-blue-600' :
            iconBg?.includes('green') ? 'text-green-600' :
            iconBg?.includes('purple') ? 'text-purple-600' : 'text-red-600'
          )} />
        </div>
      </div>
    </motion.div>
  );
}