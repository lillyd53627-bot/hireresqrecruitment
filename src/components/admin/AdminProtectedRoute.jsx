import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function AdminProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
      
        
        if (!currentUser) {
          return;
        }

        // Only allow admin role to access
        if (currentUser.role !== 'admin') {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the Admin Dashboard. 
            This area is restricted to super-admin users only.
          </p>
          <Button 
            onClick={() => window.location.href = createPageUrl('Dashboard')}
            className="bg-red-600 hover:bg-red-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return children;
}