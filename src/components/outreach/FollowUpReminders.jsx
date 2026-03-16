import React, { useState, useEffect } from 'react';
import { base44 } from '@/lib/mockBase44';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, Clock, Mail, Phone, User, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FollowUpReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      // Get all active campaigns with metadata
      const campaigns = await base44.entities.OutreachCampaign.list();
      const candidates = await base44.entities.Candidate.list();
      
      // Generate reminders based on campaign interactions
      const generatedReminders = [];
      
      for (const campaign of campaigns) {
        if (campaign.metadata?.reminders && campaign.metadata?.candidate_id) {
          const candidate = candidates.find(c => c.id === campaign.metadata.candidate_id);
          
          campaign.metadata.reminders.forEach((reminder) => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + reminder.day);
            
            generatedReminders.push({
              id: `${campaign.id}-${reminder.day}`,
              campaign_id: campaign.id,
              campaign_name: campaign.name,
              candidate_name: candidate?.name || 'Unknown',
              candidate_id: campaign.metadata.candidate_id,
              action: reminder.action,
              condition: reminder.condition,
              due_date: dueDate.toISOString(),
              priority: campaign.metadata.priority || 'Medium',
              status: 'pending',
              type: reminder.action.toLowerCase().includes('call') ? 'phone' : 
                    reminder.action.toLowerCase().includes('email') ? 'email' : 'task'
            });
          });
        }
      }

      // Sort by due date
      generatedReminders.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      
      setReminders(generatedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeReminder = (reminderId) => {
    setReminders(reminders.map(r => 
      r.id === reminderId ? { ...r, status: 'completed' } : r
    ));
  };

  const snoozeReminder = (reminderId, days = 1) => {
    setReminders(reminders.map(r => {
      if (r.id === reminderId) {
        const newDate = new Date(r.due_date);
        newDate.setDate(newDate.getDate() + days);
        return { ...r, due_date: newDate.toISOString() };
      }
      return r;
    }));
  };

  const getPriorityColor = (priority) => {
    const lower = priority?.toLowerCase() || '';
    if (lower.includes('high')) return 'border-red-200 bg-red-50';
    if (lower.includes('medium')) return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getTypeIcon = (type) => {
    if (type === 'phone') return Phone;
    if (type === 'email') return Mail;
    return CheckCircle2;
  };

  const getDaysUntil = (date) => {
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const completedReminders = reminders.filter(r => r.status === 'completed');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-500">Loading reminders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-900">{pendingReminders.length}</p>
              <p className="text-xs text-red-700">Pending Reminders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{completedReminders.length}</p>
              <p className="text-xs text-green-700">Completed Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {pendingReminders.filter(r => getDaysUntil(r.due_date) === 'Today').length}
              </p>
              <p className="text-xs text-blue-700">Due Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-600" />
              Follow-up Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReminders.map((reminder, idx) => {
              const TypeIcon = getTypeIcon(reminder.type);
              const daysUntil = getDaysUntil(reminder.due_date);
              const isOverdue = daysUntil === 'Overdue';
              const isToday = daysUntil === 'Today';

              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    getPriorityColor(reminder.priority),
                    (isOverdue || isToday) && "border-red-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isOverdue ? "bg-red-600" :
                        isToday ? "bg-orange-600" :
                        "bg-gray-600"
                      )}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{reminder.action}</h4>
                          <Badge variant="outline" className="text-xs">
                            {reminder.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {reminder.candidate_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {daysUntil}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Condition:</span> {reminder.condition}
                        </p>

                        <p className="text-xs text-gray-500">
                          Campaign: {reminder.campaign_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => completeReminder(reminder.id)}
                        className="bg-green-600 hover:bg-green-700 gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => snoozeReminder(reminder.id, 1)}
                      >
                        <Clock className="w-3 h-3" />
                        Snooze
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {pendingReminders.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending follow-up reminders at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}