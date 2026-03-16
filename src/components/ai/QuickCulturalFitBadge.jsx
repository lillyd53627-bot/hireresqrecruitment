import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CulturalFitAnalyzer from './CulturalFitAnalyzer';
import { cn } from '@/lib/utils';

export default function QuickCulturalFitBadge({ candidate, job }) {
  const [showDialog, setShowDialog] = useState(false);
  const [fitScore, setFitScore] = useState(candidate?.cultural_fit_score);

  const getScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 85) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-blue-100 text-blue-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const handleAnalysisComplete = async (analysisData) => {
    setFitScore(analysisData.cultural_fit_score);
    
    // Update candidate in database
    try {
        cultural_fit_score: analysisData.cultural_fit_score,
        match_score: analysisData.match_score,
        ai_insights: analysisData.ai_insights
      });
    } catch (error) {
      console.error('Failed to update candidate:', error);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {fitScore ? (
          <Badge className={cn('cursor-pointer hover:opacity-80 transition-opacity', getScoreColor(fitScore))}>
            <Sparkles className="w-3 h-3 mr-1" />
            {fitScore}% Cultural Fit
          </Badge>
        ) : (
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            Analyze Fit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-600" />
            Cultural Fit Analysis
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CulturalFitAnalyzer 
            candidate={candidate} 
            job={job}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}