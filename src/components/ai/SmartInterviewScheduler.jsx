import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, Sparkles, Loader2, CheckCircle2,
  Users, MapPin, Video, AlertCircle
} from 'lucide-react';

export default function SmartInterviewScheduler({ candidate, job }) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledSlot, setScheduledSlot] = useState(null);
  const [candidateAvailability, setCandidateAvailability] = useState('');
  const [interviewerEmails, setInterviewerEmails] = useState('');

  const scheduleInterview = async () => {
    setIsScheduling(true);

    try {
      // This is where you'd normally call an AI API
      // For demo/local development, we simulate a response
      const prompt = `You are an AI recruitment assistant. Schedule an interview based on the following:

CANDIDATE: ${candidate?.name || 'Not specified'}
ROLE: ${job?.title || 'Not specified'}
CANDIDATE AVAILABILITY: ${candidateAvailability || 'Flexible - weekdays 9am-5pm'}
INTERVIEWER EMAILS: ${interviewerEmails || 'Not provided'}

Your task:
1. Analyze the availability constraints
2. Suggest 3 optimal time slots that work for both parties
3. Consider timezone differences if mentioned
4. Recommend interview format (video, phone, in-person)
5. Suggest interview duration based on role level
6. Provide meeting agenda and prep materials needed

Return practical, actionable scheduling recommendations.`;

      // Simulated API response (replace with real call later)
      const simulatedResponse = {
        recommended_slots: [
          {
            date: "2026-03-15",
            time: "10:00 AM",
            timezone: "SAST",
            confidence: "High"
          },
          {
            date: "2026-03-16",
            time: "2:00 PM",
            timezone: "SAST",
            confidence: "Medium"
          },
          {
            date: "2026-03-17",
            time: "11:30 AM",
            timezone: "SAST",
            confidence: "High"
          }
        ],
        interview_format: "video",
        duration_minutes: 45,
        meeting_link: "https://meet.google.com/demo-link",
        agenda: [
          "Introduction (5 min)",
          "Technical discussion (20 min)",
          "Behavioral questions (10 min)",
          "Candidate questions (10 min)"
        ],
        prep_materials: [
          "Review candidate CV and LinkedIn",
          "Prepare 3 technical questions",
          "Share company culture deck"
        ],
        scheduling_notes: "Candidate prefers mornings; interviewers available afternoons.",
        follow_up_actions: [
          "Send calendar invites",
          "Confirm with candidate via email"
        ]
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setScheduledSlot(simulatedResponse);
    } catch (error) {
      console.error('Error scheduling interview:', error);
    } finally {
      setIsScheduling(false);
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Clock className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Interview Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              {candidate?.name || 'Candidate'} • {job?.title || 'No role specified'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Candidate Availability</Label>
              <Input
                placeholder="e.g., Weekdays after 2pm SAST, or paste availability email"
                value={candidateAvailability}
                onChange={(e) => setCandidateAvailability(e.target.value)}
                className="py-6"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Interviewer Email(s)</Label>
              <Input
                placeholder="e.g., hiring@company.com, recruiter@company.com"
                value={interviewerEmails}
                onChange={(e) => setInterviewerEmails(e.target.value)}
                className="py-6"
              />
            </div>

            <Button
              onClick={scheduleInterview}
              disabled={isScheduling}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-7 text-base gap-2"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finding Best Times...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Schedule with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {scheduledSlot && (
        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Recommended Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getFormatIcon(scheduledSlot.interview_format)}
                  <span className="font-medium text-blue-900 capitalize">
                    {scheduledSlot.interview_format} Interview
                  </span>
                </div>
                <Badge className="bg-blue-600 text-white">
                  {scheduledSlot.duration_minutes} min
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Recommended Time Slots</Label>
              <div className="space-y-3">
                {scheduledSlot.recommended_slots.map((slot, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-400 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{slot.date}</p>
                        <p className="text-sm text-gray-600">{slot.time} • {slot.timezone}</p>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {slot.confidence}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {scheduledSlot.meeting_link && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-xs font-medium text-green-700">Meeting Link</Label>
                <p className="text-sm text-green-900 mt-1 break-all">
                  {scheduledSlot.meeting_link}
                </p>
              </div>
            )}

            {scheduledSlot.agenda?.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Suggested Agenda</Label>
                <ul className="space-y-2">
                  {scheduledSlot.agenda.map((item, i) => (
                    <li key={i} className="text-base text-gray-700 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scheduledSlot.prep_materials?.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Prep Materials Needed</Label>
                <ul className="space-y-2">
                  {scheduledSlot.prep_materials.map((material, i) => (
                    <li key={i} className="text-base text-gray-700 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {scheduledSlot.scheduling_notes && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-base text-amber-900">{scheduledSlot.scheduling_notes}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 py-6 text-base">
                Modify Times
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6 text-base">
                <Calendar className="w-5 h-5 mr-2" />
                Send Invites
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}