import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      
      if (!authenticated) {
        // Redirect to login, then back to current page after login
        return;
      }

      // Check subscription status
      if (user.subscription_status !== 'active') {
        toast.error('Please subscribe to access the dashboard');
        window.location.href = '/';
        return;
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      // Not authenticated, redirect to login
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}