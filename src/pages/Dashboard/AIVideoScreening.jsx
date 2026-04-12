// src/pages/Dashboard/Interviews.jsx
import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Play, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Interviews() {
  const { currentPlan } = useOutletContext();
  const navigate = useNavigate();

  const hasVideoScreening = ['growth', 'advance'].includes(currentPlan?.plan);

  if (!hasVideoScreening) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Video className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">AI Video Interviews</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Automated video screening with smart scoring and candidate insights.
        </p>
        <Button onClick={() => navigate('/pricing')} className="bg-red-600 hover:bg-red-700">
          Upgrade to Unlock AI Video Screening
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Video Interviews</h1>
          <p className="text-gray-600">Automated screening and analysis</p>
        </div>
        <Button className="bg-red-600">+ Schedule Interview</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold">12</div>
            <p className="text-sm text-gray-600">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600">5</div>
            <p className="text-sm text-gray-600">Completed Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold">8</div>
            <p className="text-sm text-gray-600">AI Screening</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-gray-600">Avg. Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Interview List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Completed Interviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add your interview cards here matching screenshot style */}
          <div className="p-4 border rounded-xl flex justify-between items-center">
            <div>
              <p className="font-medium">Sarah Johnson - Senior Software Engineer</p>
              <p className="text-sm text-gray-500">Today • 2:00 PM • Video</p>
            </div>
            <Button size="sm" className="bg-red-600">Join</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}