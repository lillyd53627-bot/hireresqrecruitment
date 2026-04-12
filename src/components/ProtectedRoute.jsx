import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      // 🔥 Check if user has a paid plan
      const { data: planData } = await supabase
        .from("users")
        .select("plan")
        .eq("email", userData.user.email)
        .single();

      if (planData?.plan) {
        setIsAllowed(true); // ✅ PAID USER
      } else {
        setIsAllowed(false); // ❌ NOT PAID
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  if (!isAllowed) return <Navigate to="/pricing" />;

  return children;
}