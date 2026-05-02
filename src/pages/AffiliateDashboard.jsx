// Updated on 2026-05-02// src/pages/AffiliateDashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, User, Gift, FileText, Wallet, Settings, MessageCircle, Users } from "lucide-react";
import Logo from "@/assets/HireResQ.png";     // ← Added this line


        <div className="mb-10">
          <img src={Logo} alt="HireResQ" className="h-12" />
        </div>

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [allAffiliates, setAllAffiliates] = useState([]);
  const [activeTab, setActiveTab] = useState("earnings");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

      const { data: all } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      setAllAffiliates(all || []);

      setIsAdmin(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

  const copyLink = () => {
    if (!affiliate?.referral_code) return;
    const link = `https://yourdomain.co.za/register?ref=${affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    alert("Referral link copied!");
  };

  const sidebarItems = [
    { id: "earnings", label: "Earnings", icon: <Wallet size={20} /> },
    { id: "referral", label: "Referral Material", icon: <Gift size={20} /> },
    { id: "profile", label: "Profile", icon: <User size={20} /> },
    { id: "terms", label: "Terms", icon: <FileText size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col fixed h-full">
        <div className="mb-10">
          <img src="/HireResQ.png" alt="HireResQ" className="h-12" />
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === "admin" ? "bg-red-600 text-white" : "hover:bg-zinc-800 text-gray-400 hover:text-white"
              }`}
            >
              <Users size={20} />
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        <a 
          href="https://wa.me/27834676026" 
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 text-green-500 hover:bg-zinc-800 rounded-2xl mt-auto"
        >
          <MessageCircle size={20} /> WhatsApp Support
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Affiliate Dashboard</h1>
          <p className="text-gray-400 mb-10">Welcome back, {affiliate?.name}</p>

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div>
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
                  <p className="text-gray-400">Total Earnings</p>
                  <p className="text-5xl font-bold text-red-500">R {totalEarnings}</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
                  <p className="text-gray-400">Commission Rate</p>
                  <p className="text-5xl font-bold">Up to 40%</p>
                </div>
                <div className="bg-zinc-900 p-8 rounded-3xl border border-red-600/30">
                  <p className="text-gray-400">Referrals</p>
                  <p className="text-5xl font-bold">{commissions.length}</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Commission Structure</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-400">Tiered Commission</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex justify-between"><span>Starter Plan</span><span className="font-semibold">R619 (40%)</span></li>
                      <li className="flex justify-between"><span>Growth Plan</span><span className="font-semibold">R1,200 (40%)</span></li>
                      <li className="flex justify-between"><span>Advance Plan</span><span className="font-semibold">R2,000 (40%)</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-red-400">How Payments Work</h3>
                    <p className="text-gray-400 leading-relaxed">
                      • Commission paid within 7 days after referred user pays.<br/>
                      • 40% on first payment.<br/>
                      • Minimum payout: R500
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Material Tab - Now includes Marketing Tools */}
          {activeTab === "referral" && (
            <div className="space-y-8">
              <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Your Unique Referral Link</h2>
                <div className="bg-black p-6 rounded-2xl font-mono text-red-400 break-all mb-6">
                  https://yourdomain.co.za/register?ref={affiliate?.referral_code}
                </div>
                <button onClick={copyLink} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-2xl flex items-center gap-2">
                  <Copy size={20} /> Copy Link
                </button>
              </div>

              {/* Marketing Tools */}
              <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">Marketing Tools</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-950 p-6 rounded-2xl">
                    <h3 className="font-semibold mb-3">Recommended Email Subject Lines</h3>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li>• "Stop wasting time on bad hires..."</li>
                      <li>• "AI-Powered Recruitment at R1,549/month"</li>
                      <li>• "Get 100+ AI-matched candidates in 48 hours"</li>
                    </ul>
                  </div>
                  <div className="bg-zinc-950 p-6 rounded-2xl">
                    <h3 className="font-semibold mb-3">Social Media Posts</h3>
                    <p className="text-sm text-gray-400">
                      "Tired of spending hours screening candidates? <br/>
                      HireResQ uses AI to find & shortlist the best talent instantly.<br/>
                      Try it free → [Your Referral Link]"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Profile & Verification</h2>
              <div className="space-y-6">
                <div><p className="text-gray-400">Full Name</p><p className="text-xl">{affiliate?.name}</p></div>
                <div><p className="text-gray-400">Email</p><p className="text-xl">{affiliate?.email}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="text-xl">{affiliate?.phone || "Not provided"}</p></div>
              </div>
            </div>
          )}

          {/* Terms Tab - Updated */}
          {activeTab === "terms" && (
            <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Affiliate Programme Terms</h2>
              <div className="prose prose-invert max-w-none text-gray-300">
                <p className="text-lg mb-6">
                  By participating in the HireResQ Affiliate Programme, you agree to the following terms:
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-3">1. Commission</h3>
                <p>Affiliates earn up to 40% commission on the first successful payment from referred customers.</p>

                <h3 className="text-xl font-semibold mt-8 mb-3">2. Payment</h3>
                <p>Commissions are paid within 7 business days after the referred client completes payment. Minimum payout is R500.</p>

                <h3 className="text-xl font-semibold mt-8 mb-3">3. Prohibited Activities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Spam or unsolicited bulk messaging</li>
                  <li>False or misleading claims about HireResQ</li>
                  <li>Bidding on HireResQ branded keywords</li>
                  <li>Using our logo or branding without permission</li>
                </ul>

                <h3 className="text-xl font-semibold mt-8 mb-3">4. Termination</h3>
                <p>HireResQ reserves the right to suspend or terminate any affiliate account for violation of these terms.</p>

                <p className="text-sm text-gray-500 mt-10">
                  Last updated: May 2026 • These terms may be updated from time to time.
                </p>
              </div>
            </div>
          )}

          {/* Settings & Admin Tabs */}
          {activeTab === "settings" && (
            <div className="bg-zinc-900 border border-red-600/30 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <p className="text-gray-400">Account settings and payout details coming soon.</p>
            </div>
          )}

          {activeTab === "admin" && isAdmin && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Admin Panel - All Affiliates</h2>
              <div className="bg-zinc-900 border border-red-600/30 rounded-3xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="text-left p-6">Name</th>
                      <th className="text-left p-6">Email</th>
                      <th className="text-left p-6">Phone</th>
                      <th className="text-left p-6">Referral Code</th>
                      <th className="text-left p-6">Status</th>
                      <th className="text-left p-6">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAffiliates.map((a) => (
                      <tr key={a.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                        <td className="p-6">{a.name}</td>
                        <td className="p-6">{a.email}</td>
                        <td className="p-6">{a.phone || "—"}</td>
                        <td className="p-6 font-mono">{a.referral_code}</td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm">
                            {a.status || "active"}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-gray-400">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}