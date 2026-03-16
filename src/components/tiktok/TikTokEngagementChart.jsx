import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function TikTokEngagementChart({ isConnected }) {
  // Placeholder data
  const placeholderData = [
    { date: 'Jan 1', engagementRate: 7.2, likes: 450, comments: 32, shares: 18 },
    { date: 'Jan 5', engagementRate: 8.1, likes: 520, comments: 45, shares: 25 },
    { date: 'Jan 10', engagementRate: 6.8, likes: 390, comments: 28, shares: 15 },
    { date: 'Jan 15', engagementRate: 9.3, likes: 680, comments: 58, shares: 42 },
    { date: 'Jan 20', engagementRate: 8.7, likes: 610, comments: 51, shares: 35 },
    { date: 'Jan 25', engagementRate: 10.2, likes: 790, comments: 72, shares: 55 },
    { date: 'Jan 30', engagementRate: 9.5, likes: 720, comments: 64, shares: 48 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Engagement Rate Over Time
        </CardTitle>
        {!isConnected && (
          <p className="text-xs text-gray-500">Placeholder data - Connect TikTok for real insights</p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={placeholderData}>
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="engagementRate" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Engagement Rate (%)"
              dot={{ fill: '#ef4444', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500">Avg Likes</p>
            <p className="text-lg font-bold">610</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Comments</p>
            <p className="text-lg font-bold">50</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Shares</p>
            <p className="text-lg font-bold">34</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}