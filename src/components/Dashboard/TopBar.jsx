import React from 'react';
import { Search, Bell, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopBar({ title, subtitle }) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">{title}</h1>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search candidates, jobs..."
              className="pl-10 w-64 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-red-600/20"
            />
          </div>

          {/* AI Quick Action */}
          <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
            <Sparkles className="w-4 h-4" />
            AI Action
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <DropdownMenuItem className="p-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">New candidate matched</p>
                    <p className="text-xs text-gray-500">Sarah Johnson - 95% match for Senior Developer</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium text-sm">Interview completed</p>
                    <p className="text-xs text-gray-500">AI scoring complete - view results</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">JR</span>
          </div>
        </div>
      </div>
    </header>
  );
}