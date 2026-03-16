import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Linkedin, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LinkedInShareButton({ job }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [shared, setShared] = useState(false);

  const defaultMessage = `We're hiring! 🎯

${job.title} at ${job.company}
📍 ${job.location}
💰 ${job.salary_min && job.salary_max ? `R${job.salary_min.toLocaleString()} - R${job.salary_max.toLocaleString()}` : 'Competitive salary'}

${job.description ? job.description.substring(0, 200) + '...' : ''}

Interested? Apply now! #hiring #jobs #recruitment #${job.company.replace(/\s+/g, '')}`;

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = ('shareJobToLinkedIn', {
        jobId: job.id,
        message: message || defaultMessage
      });

      if (response.data.success) {
        toast.success('Job successfully shared to LinkedIn!');
        setShared(true);
        setTimeout(() => {
          setOpen(false);
          setShared(false);
          setMessage('');
        }, 2000);
      } else {
        toast.error(response.data.error || 'Failed to share to LinkedIn');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to share. Make sure LinkedIn is authorized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Linkedin className="w-4 h-4 text-blue-600" />
          Share to LinkedIn
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            Share Job to LinkedIn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Post Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customize your message or leave blank to use the default
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">{job.title}</h4>
            <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
            {job.salary_min && job.salary_max && (
              <p className="text-sm text-gray-600 mt-1">
                R{job.salary_min.toLocaleString()} - R{job.salary_max.toLocaleString()}
              </p>
            )}
          </div>

          <Button
            onClick={handleShare}
            disabled={loading || shared}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : shared ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Shared Successfully!
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 mr-2" />
                Share to LinkedIn
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}