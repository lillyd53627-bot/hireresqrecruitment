import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

export default function FollowerGrowthChart({ isConnected }) {
  // Placeholder data
  const placeholderData = [
    { date: 'Jan 1', followers: 10200, newFollowers: 0 },
    { date: 'Jan 5', followers: 10580, newFollowers: 380 },
    { date: 'Jan 10', followers: 10950, newFollowers: 370 },
    { date: 'Jan 15', followers: 11420, newFollowers: 470 },
    { date: 'Jan 20', followers: 11780, newFollowers: 360 },
    { date: 'Jan 25', followers: 12210, newFollowers: 430 },
    { date: 'Jan 30', followers: 12450, newFollowers: 240 },
  ];

  const totalGrowth = placeholderData[placeholderData.length - 1].followers - placeholderData[0].followers;
  const growthPercentage = ((totalGrowth / placeholderData[0].followers) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Follower Growth Trends
        </CardTitle>
        {!isConnected && (
          <p className="text-xs text-gray-500">Placeholder data - Connect TikTok for real insights</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={placeholderData}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="followers" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFollowers)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Total Growth</p>
            <p className="text-lg font-bold text-green-600">+{totalGrowth.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Growth Rate</p>
            <p className="text-lg font-bold text-green-600">+{growthPercentage}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}