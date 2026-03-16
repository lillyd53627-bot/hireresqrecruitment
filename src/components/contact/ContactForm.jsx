import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm({ onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const consent = watch('consent');
  const enquiryReason = watch('enquiryReason');

  const onSubmit = async (data) => {
    if (!consent) {
      toast.error('Please agree to our contact policy');
      return;
    }

    if (!enquiryReason) {
      toast.error('Please select an enquiry reason');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = ('submitContactForm', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        enquiryReason: enquiryReason,
        message: data.message,
        consent: consent
      });

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setSubmitted(true);
        toast.success(response.data.message);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error('Failed to submit. Please try again or call us at 010 500 6844.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-700 mb-4">
            We've received your enquiry. A HireResQ team member will call you back within 24 hours.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>Or call us directly: <strong>010 500 6844</strong></span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch – Request a Callback</h2>
          <p className="text-gray-600">
            Fill in your details below and we'll call you back to discuss how HireResQ AI can automate your recruitment.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-red-600">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Or call us directly: 010 500 6844</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden honeypot field */}
          <input type="text" name="website" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">
                Full Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="fullName"
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="John Smith"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                Business Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Business email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="john@company.co.za"
                className={errors.email ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">We only accept business emails for recruiters/agencies</p>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phone">
                Phone Number / WhatsApp <span className="text-red-600">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+27 or 010..."
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Your Agency Ltd"
              />
              <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
            </div>
          </div>

          <div>
            <Label htmlFor="enquiryReason">
              Enquiry Reason <span className="text-red-600">*</span>
            </Label>
            <Select onValueChange={(value) => setValue('enquiryReason', value)}>
              <SelectTrigger className={!enquiryReason && 'text-gray-400'}>
                <SelectValue placeholder="Select your enquiry type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Interested in AI Hiring Department">Interested in AI Hiring Department</SelectItem>
                <SelectItem value="Client Finder (finding companies actively hiring)">Client Finder (finding companies actively hiring)</SelectItem>
                <SelectItem value="Partnership or White-Label Opportunity">Partnership or White-Label Opportunity</SelectItem>
                <SelectItem value="General Enquiry / Other">General Enquiry / Other</SelectItem>
              </SelectContent>
            </Select>
            {!enquiryReason && (
              <p className="text-xs text-gray-500 mt-1">Please select an option</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message / Additional Details</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Tell us about your recruitment needs or any questions..."
              className="h-32"
            />
            <p className="text-xs text-gray-500 mt-1">Optional</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setValue('consent', checked)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm cursor-pointer">
              <span className="text-red-600">*</span> I agree to HireResQ AI contacting me via email/phone/WhatsApp regarding my enquiry. 
              Read our <a href="/privacy" className="text-red-600 underline">Privacy Policy</a> for POPIA compliance.
            </Label>
          </div>
          {!consent && (
            <p className="text-xs text-gray-500 -mt-2">Required for POPIA consent</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 mr-2" />
                Request Callback
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            We'll call you back within 24 hours to discuss how we can scale your placements with AI.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}