import React, { useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import TopBar from '../../components/Dashboard/TopBar';
import RecruitmentAssistantChat from '../../components/ai/RecruitmentAssistantChat';

export default function AIAssistant() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <TopBar
          title="AI Recruitment Assistant"
          subtitle="Get instant help with sourcing, screening, and shortlisting candidates"
        />

        <div className="p-6 max-w-5xl mx-auto">
          <RecruitmentAssistantChat />
        </div>
      </main>
    </div>
  );
}