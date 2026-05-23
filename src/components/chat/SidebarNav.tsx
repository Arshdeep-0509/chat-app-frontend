import React from 'react';
import { MessageSquare, Settings, User, LogOut, Bell } from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  unreadCount?: number;
  notificationCount?: number;
  onLogout?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 45,
  notificationCount = 3,
  onLogout
}) => {
  const topNavItems = [
    { id: 'chats', icon: MessageSquare, label: 'Chats' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    // { id: 'status', icon: Radio, label: 'Status' },
    // { id: 'groups', icon: Users, label: 'Groups' },
    // { id: 'ai', icon: Sparkles, label: 'Meta AI', customColor: 'text-violet-400' },
  ];

  return (
    <div className="w-full md:w-[64px] bg-[#0c1220] border-t md:border-r md:border-t-0 border-slate-800/80 flex flex-row md:flex-col justify-between items-center py-2 px-6 md:px-0 md:py-4 select-none shrink-0 h-[60px] md:h-full">
      {/* Top Icons */}
      <div className="flex flex-row md:flex-col gap-4 md:gap-5 items-center">
        {topNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative p-3 rounded-xl transition-all duration-200 cursor-pointer group flex items-center justify-center ${
                isActive
                  ? 'bg-slate-800 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
              title={item.label}
            >
              <Icon className={`w-[22px] h-[22px]`} />

              {/* Tooltip */}
              <div className="absolute left-[70px] bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-55 shadow-lg border border-slate-800 hidden md:block">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-row md:flex-col gap-4 md:gap-4 items-center">
        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`relative p-3 rounded-xl transition-all duration-200 cursor-pointer group flex items-center justify-center ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-blue-400'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
          title="Settings"
        >
          <Settings className="w-[22px] h-[22px]" />
          <div className="absolute left-[70px] bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-55 shadow-lg border border-slate-800 hidden md:block">
            Settings
          </div>
        </button>

        {/* User Profile */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`relative p-0.5 rounded-full border-2 transition-all duration-200 cursor-pointer group flex items-center justify-center ${
            activeTab === 'profile' ? 'border-blue-400' : 'border-transparent hover:border-slate-600'
          }`}
          title="Profile"
        >
          <div className="w-[36px] h-[36px] rounded-full bg-slate-700 flex items-center justify-center overflow-hidden text-slate-200 font-bold border border-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback to User icon
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <User className="w-[18px] h-[18px] text-slate-400" />
          </div>
          
          <div className="absolute left-[70px] bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-55 shadow-lg border border-slate-800 hidden md:block">
            Profile View
          </div>
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-3 rounded-xl text-red-400/80 hover:bg-red-950/30 hover:text-red-400 cursor-pointer transition-all duration-200 group relative flex items-center justify-center"
            title="Log Out"
          >
            <LogOut className="w-[22px] h-[22px]" />
            <div className="absolute left-[70px] bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none md:group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-55 shadow-lg border border-slate-800 hidden md:block">
              Log Out
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
