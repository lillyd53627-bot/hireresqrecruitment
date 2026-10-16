import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";

const CONFIG = {
  affiliate: {
    role: "affiliate",
    badge: "25% flat of placement fee",
    title: "Lead Partner registration",
    subtitle:
      "Register to refer hiring leads and earn a flat 25% of the placement fee when HireResQ makes a successful placement. No subscription.",
    cta: "Create Lead Partner account",
    successMessage: "Redirecting to login…",
    redirectTo: "/login",
  },
  recruiter: {
    role: "recruiter",
    badge: "Up to 50% commission",
    title: "Independent Recruiter registration",
    subtitle:
      "Create your account and get your own recruiter dashboard. Earn up to 50% commission — no monthly subscription.",
    cta: "Create Independent Recruiter account",
    successMessage: "Taking you to your dashboard…",
    redirectTo: "/dashboard/recruiter",
  },
};

export default function PartnerRegister() {
  const { type } = useParams();
  const navigate = useNavigate();
  const config = CONFIG[type] || null;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!formData.email || !formData.fullName || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone || null,
            role: config.role,
          },
        },
      });

      if (signUpError) throw signUpError;

      const userId = authData?.user?.id;
      if (userId) {
        const payload = {
          id: userId,
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone || null,
          role: config.role,
        };
        if (config.role === "recruiter") {
          payload.commission_rate = 0.5;
        }
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" });
        if (profileError) console.error(profileError);
      }

      setSuccess(true);
      setTimeout(() => navigate(config.redirectTo), 1400);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Invalid partner type</h1>
          <Button asChild className="mt-6 bg-red-600 hover:bg-red-700">
            <Link to="/partners">Back to Partners</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="border-0 shadow max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Account created</h2>
            <p className="text-sm text-gray-500 mt-2">{config.successMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link
          to="/partners"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </Link>

        <div className="mb-8">
          <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-100">
            {config.badge}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-600 mt-3">{config.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-8 rounded-2xl shadow"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <Label>Full Name *</Label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Phone / WhatsApp</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Password * (min 8 characters)</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div>
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
          >
            {loading ? "Creating account…" : config.cta}
          </Button>

          <p className="text-center text-sm text-gray-500">
            No subscription. Earn from placements only.
          </p>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}