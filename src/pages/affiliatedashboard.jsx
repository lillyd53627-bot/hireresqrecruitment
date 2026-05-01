import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, MessageCircle } from "lucide-react";

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("*")
        .limit(1)
        .single();

      setAffiliate(aff);

      if (aff) {
        const { data: comms } = await supabase
          .from("commissions")
          .select("*")
          .eq("affiliate_id", aff.id)
          .order("created_at", { ascending: false });

        setCommissions(comms || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

  const copyLink = () => {
    if (!affiliate?.referral_code) return;
    const link = `https://yourdomain.com/register?ref=${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    alert("Referral link copied to clipboard!");
  };

  if (loading) return <div className="p-12 text-center text-white">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold">Affiliate Dashboard</h1>
            <p className="text-gray-400">Welcome back, {affiliate?.name}</p>
          </div>
          <a 
            href="https://wa.me/27834676026" 
            target="_blank"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-2xl text-sm font-medium"
          >
            <MessageCircle size={20} /> WhatsApp Support
          </a>
        </div>

        {/* Referral Link */}
        {affiliate && (
          <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8 mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Unique Referral Link</h2>
              <button 
                onClick={copyLink}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl text-sm font-medium"
              >
                <Copy size={18} /> Copy Link
              </button>
            </div>
            <div className="bg-black p-4 rounded-2xl font-mono text-red-400 break-all">
              https://yourdomain.com/register?ref={affiliate.referral_code}
            </div>
          </div>
        )}

        {/* Earnings Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
            <p className="text-gray-400">Total Earnings</p>
            <p className="text-5xl font-bold text-red-500 mt-2">R {totalEarnings}</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
            <p className="text-gray-400">Commission Rate</p>
            <p className="text-5xl font-bold mt-2">40% + 20%</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
            <p className="text-gray-400">Referrals</p>
            <p className="text-5xl font-bold mt-2">{commissions.length}</p>
          </div>
        </div>

        {/* Commission Structure Table */}
        <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6">Commission Structure</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="py-4">Package Price</th>
                <th className="py-4">40% Upfront</th>
                <th className="py-4">20% Recurring Monthly</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-zinc-800">
                <td className="py-4">R1,549</td>
                <td className="py-4 text-green-500">R619.60</td>
                <td className="py-4">R309.80 / month</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-4">R3,999</td>
                <td className="py-4 text-green-500">R1,599.60</td>
                <td className="py-4">R799.80 / month</td>
              </tr>
              <tr>
                <td className="py-4">R7,999</td>
                <td className="py-4 text-green-500">R3,199.60</td>
                <td className="py-4">R1,599.80 / month</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-400 mt-6">
            Example: 5 sales per week can earn you <strong>R8,000 – R15,000+</strong> per week.
          </p>
        </div>

        <div className="text-center text-gray-500 text-sm mt-12">
          Need help? WhatsApp: <strong>083 467 6026</strong>
        </div>
      </div>
    </div>
  );
}