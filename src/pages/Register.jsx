import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, Phone, Globe, DollarSign, Briefcase, Users, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';  // ← ADD THIS LINE

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [selectedPlan, setSelectedPlan] = useState('starter'); // default

  const plans = {
    starter: { name: 'Starter', amount: 154900, display: 'R1,549/month' },
    growth: { name: 'Growth', amount: 399900, display: 'R3,999/month' },
    advance: { name: 'Advance', amount: 799900, display: 'R7,999/month' },
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    // Basic validation
    if (!formData.email || !formData.fullName || !formData.password) {
      alert("Please fill in all required fields");
      return;
    }

    // Paystack popup
    const handler = PaystackPop.setup({
      key: 'pk_test_1e3c9cf56e6baaf0baa8481ef4eae75e1807e898', // ← REPLACE WITH YOUR PAYSTACK TEST PUBLIC KEY
      email: formData.email,
      amount: plans[selectedPlan].amount * 100, // convert to kobo
      currency: 'ZAR',
      ref: '' + Math.floor((Math.random() * 1000000000) + 1), // unique ref
      metadata: {
        custom_fields: [
          { display_name: "Plan", variable_name: "plan", value: plans[selectedPlan].name },
          { display_name: "Full Name", variable_name: "full_name", value: formData.fullName },
          { display_name: "Company", variable_name: "company", value: formData.companyName || 'N/A' },
        ],
      },
      onClose: () => {
        alert('Payment window closed.');
      },
      callback: (response) => {
        alert('Payment successful! Reference: ' + response.reference);
        // In real app: save user to backend, create subscription, redirect to dashboard
        window.location.href = '/dashboard'; // or success page
      },
    });

    handler.openIframe();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        {/* Left: Form */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600 mb-8">Join hundreds of South African recruiters automating their hiring.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Password * (min 8 characters)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Plan Selection */}
            <div className="pt-6 border-t">
              <Label className="text-lg font-medium mb-4 block">Select Your Plan</Label>
              <RadioGroup
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                className="grid gap-4"
              >
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {plan.name} – {plan.display}
                      </Label>
                      {key === 'growth' && (
                        <Badge className="ml-2 bg-red-600">Most Popular</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-7 text-xl font-medium mt-8"
            >
              Continue to Payment – {plans[selectedPlan].display}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              By registering, you agree to our Terms of Service and Privacy Policy (POPIA compliant)
            </p>
          </form>
        </div>

        {/* Right: Plan benefits summary */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>What's included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Unlimited AI sourcing & screening</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Automated outreach & meeting booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Video interviews with smart scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Auto-invoicing & payment tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Dedicated support & white-label options</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}