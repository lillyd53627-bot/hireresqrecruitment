import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AffiliateRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleRegister = async () => {
    if (!name || !email) {
      setError("Please fill in Name and Email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = generateCode();

      const { error: insertError } = await supabase.from("affiliates").insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        referral_code: code
        // Removed 'status' and 'phone' to match your current table structure
      });

      if (insertError) {
        console.error("Insert Error:", insertError);
        if (insertError.message.includes("duplicate") || insertError.code === "23505") {
          setError("This email is already registered. Please use a different email.");
        } else {
          setError(`Registration failed: ${insertError.message}`);
        }
        return;
      }

      alert("✅ Registration successful! Welcome to the HireResQ Affiliate Program.");
      window.location.href = "/affiliate/dashboard";

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 rounded-3xl shadow-2xl p-10 w-full max-w-md border border-red-600/30">
        
        <div className="text-center mb-8">
          <img src="/HireResQ.png" alt="HireResQ" className="mx-auto h-20 mb-4" />
          <h2 className="text-3xl font-bold">Join Our Affiliate Program</h2>
          <p className="text-gray-400 mt-2">Start earning with AI-Powered Hiring</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-300 p-4 rounded-2xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl focus:outline-none focus:border-red-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-zinc-800 border border-zinc-700 p-4 rounded-2xl focus:outline-none focus:border-red-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 mt-4"
          >
            {loading ? "Registering..." : "Join Affiliate Program"}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          40% Commission + Recurring Income • Weekly Payouts
        </p>
      </div>
    </div>
  );
}