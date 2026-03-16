import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function AdminTopBar({ title, subtitle, onSearch }) {
  const handleLogout = async () => {
    window.location.href = createPageUrl('Dashboard');
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 w-80"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}

          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}