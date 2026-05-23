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
    <div className="h-[100dvh] w-screen bg-[#0b0f19] flex flex-col md:flex-row overflow-hidden">
      {/* Navigation Bar */}
      <div className="order-2 md:order-1 z-50">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          notificationCount={notificationCount}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden h-full relative order-1 md:order-2">
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
