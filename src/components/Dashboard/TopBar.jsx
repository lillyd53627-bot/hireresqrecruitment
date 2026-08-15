import React from "react";
import { Search, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TopBar({
  title = "Dashboard",
  subtitle = "Live overview",
}) {
  return (
    <header className="h-[108px] bg-white border-b border-gray-100">
      <div className="h-full px-8 flex items-center justify-between">

        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-black leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">

          {/* SEARCH */}
          <div className="relative hidden md:block">
            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                w-4
                h-4
                text-gray-400
              "
            />

            <Input
              placeholder="Search candidates, jobs..."
              className="
                w-64
                h-10
                pl-10
                bg-gray-50
                border-0
                rounded-lg
              "
            />
          </div>

          {/* AI ACTION */}
          <Button
            className="
              h-10
              bg-red-600
              hover:bg-red-700
              text-white
              gap-2
              rounded-lg
            "
          >
            <Sparkles className="w-4 h-4" />
            AI Action
          </Button>

          {/* NOTIFICATIONS */}
          <Button
            variant="ghost"
            size="icon"
            className="relative w-10 h-10"
          >
            <Bell className="w-5 h-5 text-gray-600" />

            <span
              className="
                absolute
                top-2
                right-2
                w-2
                h-2
                bg-red-600
                rounded-full
              "
            />
          </Button>

          {/* PROFILE */}
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-gray-100
              flex
              items-center
              justify-center
            "
          >
            <span className="text-sm font-bold text-gray-600">
              JR
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}