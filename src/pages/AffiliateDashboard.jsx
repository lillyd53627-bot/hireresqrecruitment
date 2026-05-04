// src/pages/AffiliateDashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, User, Gift, FileText, Wallet, Settings, MessageCircle, Users } from "lucide-react";
import Logo from "@/assets/HireResQ.png";   // ← Only this line added

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
          <img src={Logo} alt="HireResQ" className="h-12" />   {/* ← Updated here */}
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

          {/* ... ALL OTHER CODE REMAINS EXACTLY THE SAME ... */}
          {/* (Earnings, Referral, Profile, Terms, Admin tabs unchanged) */}

        </div>
      </div>
    </div>
  );
}