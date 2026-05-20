import React from 'react';
import { SidebarNav } from '../components/chat/SidebarNav';

interface ChatLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  unreadCount?: number;
  notificationCount?: number;
  onLogout?: () => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  unreadCount,
  notificationCount,
  onLogout
}) => {
  return (
    <div className="h-screen w-screen bg-[#0b0f19] flex overflow-hidden">
      {/* Vertical Navigation Bar */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden h-full relative">
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
