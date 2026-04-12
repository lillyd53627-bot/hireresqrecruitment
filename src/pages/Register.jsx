// src/pages/Register.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Register() {
  const [searchParams] = useSearchParams();
  const defaultPlan = searchParams.get('plan') || 'starter';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [loading, setLoading] = useState(false);

  const plans = {
    starter: { name: 'Starter', amount: 1549, display: 'R1,549' },
    growth: { name: 'Growth', amount: 3999, display: 'R3,999' },
    advance: { name: 'Advance', amount: 7999, display: 'R7,999' },
  };

  const currentPlan = plans[selectedPlan];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!formData.email || !formData.fullName || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    // Your Live Paystack Key
    const paystackKey = "pk_live_cc5867f5fb5677cf09c944f61d1bc5692e8bb46e";

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: formData.email,
      amount: currentPlan.amount * 100,        // Correct amount in kobo
      currency: 'ZAR',
      ref: `hrq_${Date.now()}`,
      
      // Force show Card + EFT (Bank Transfer) + QR
      channels: ['card', 'bank_transfer', 'qr'],

      metadata: {
        custom_fields: [
          { display_name: "Full Name", variable_name: "full_name", value: formData.fullName },
          { display_name: "Plan", variable_name: "plan", value: currentPlan.name },
          { display_name: "Phone/WhatsApp", variable_name: "phone", value: formData.phone || 'N/A' },
        ],
      },
      callback: function(response) {
        alert('Payment successful!');
        window.location.href = `/payment-success?reference=${response.reference}`;
      },
      onClose: function() {
        alert('Payment window closed.');
      }
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        {/* Left: Form */}
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              An AI-powered hiring machine that runs your recruitment business for you.
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Find clients who are hiring + source candidates automatically — 30 days at a time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow">
            <div>
              <Label>Full Name *</Label>
              <Input name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </div>

            <div>
              <Label>Business or Personal Email *</Label>
              <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            <div>
              <Label>Phone / WhatsApp (important for launch offers)</Label>
              <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="083 467 6026" />
            </div>

            <div>
              <Label>Password * (min 8 characters)</Label>
              <Input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            </div>

            <div>
              <Label>Confirm Password *</Label>
              <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>

            {/* Plan Selection */}
            <div className="pt-4">
              <Label className="text-lg font-medium block mb-4">Select Your Plan</Label>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${selectedPlan === key ? 'border-red-600 bg-red-50' : 'border-gray-200'}`}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <label htmlFor={key} className="font-medium cursor-pointer flex items-center gap-2">
                        {plan.name} — {plan.display} for 30 days
                        {key === 'growth' && <Badge className="bg-red-600 text-white">Most Popular</Badge>}
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-7 text-xl font-medium"
            >
              Create Account & Pay {currentPlan.display} for 30 days
            </Button>

            <p className="text-center text-sm text-gray-500">
              One-time payment for 30 days access • No auto-renewal • Cancel or pause anytime
            </p>
          </form>
        </div>

        {/* Right: Benefits */}
        <div className="hidden md:block pt-12">
          <Card>
            <CardHeader>
              <CardTitle>What's included with your 30-day package</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>AI finds companies actively hiring (you get clients)</div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>AI sources top candidates automatically</div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>Automated outreach that books meetings</div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>Video interviews with smart scoring</div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                <div>CRM, job tracker, invoicing & reporting</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}