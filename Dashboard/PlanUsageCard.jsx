import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PlanUsageCard({ plan }) {
  const jobsUsagePercent = (plan.limits.currentJobs / plan.limits.activeJobs) * 100;
  const usersUsagePercent = (plan.limits.currentUsers / plan.limits.users) * 100;

  const getUsageColor = (percent) => {
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-amber-600';
    return 'text-green-600';
  };

  const getProgressColor = (percent) => {
    if (percent >= 90) return 'bg-red-600';
    if (percent >= 70) return 'bg-amber-600';
    return 'bg-green-600';
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Plan Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Active Jobs</span>
            <span className={`text-sm font-bold ${getUsageColor(jobsUsagePercent)}`}>
              {plan.limits.currentJobs}/{plan.limits.activeJobs}
            </span>
          </div>
          <Progress value={jobsUsagePercent} className="h-2" />
          {jobsUsagePercent >= 80 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              You're approaching your limit. Consider upgrading.
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Team Members</span>
            <span className={`text-sm font-bold ${getUsageColor(usersUsagePercent)}`}>
              {plan.limits.currentUsers}/{plan.limits.users}
            </span>
          </div>
          <Progress value={usersUsagePercent} className="h-2" />
        </div>

        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-semibold text-gray-700">Your Plan Features:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">AI Client Finder</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">AI Candidate Sourcing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {plan.features.videoScreening ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={plan.features.videoScreening ? 'text-gray-600' : 'text-gray-400'}>
                AI Video Screening
              </span>
              {!plan.features.videoScreening && (
                <Badge variant="outline" className="text-xs">Upgrade</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {plan.features.clientPortal ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={plan.features.clientPortal ? 'text-gray-600' : 'text-gray-400'}>
                Client Portal
              </span>
              {!plan.features.clientPortal && (
                <Badge variant="outline" className="text-xs">Upgrade</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {plan.features.whiteLabel ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={plan.features.whiteLabel ? 'text-gray-600' : 'text-gray-400'}>
                White-Label Platform
              </span>
              {!plan.features.whiteLabel && (
                <Badge variant="outline" className="text-xs">Pro Only</Badge>
              )}
            </div>
          </div>
        </div>

        {(jobsUsagePercent >= 70 || !plan.features.videoScreening) && (
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
            Upgrade Your Plan
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}