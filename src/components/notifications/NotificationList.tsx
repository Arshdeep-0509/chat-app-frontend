import React, { useState } from 'react';
import { UserCheck, UserX, AlertCircle, Bell, Check, Trash2 } from 'lucide-react';

export interface NotificationType {
  id: string;
  type: 'request' | 'invite' | 'system';
  title: string;
  description: string;
  timestamp: string;
  avatar?: string;
  isRead: boolean;
  meta?: {
    userId?: string;
    groupId?: string;
  };
}

interface NotificationListProps {
  notifications: NotificationType[];
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onClearAll: () => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onAcceptRequest,
  onDeclineRequest,
  onClearAll,
  onMarkAllRead,
  onDeleteNotification
}) => {
  const [filter, setFilter] = useState<'all' | 'requests' | 'system'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'requests') return n.type === 'request' || n.type === 'invite';
    return n.type === 'system';
  });

  const renderIcon = (notification: NotificationType) => {
    switch (notification.type) {
      case 'request':
        return (
          <div className="w-[42px] h-[42px] rounded-full bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
        );
      case 'invite':
        return (
          <div className="w-[42px] h-[42px] rounded-full bg-purple-950/60 border border-purple-900/40 flex items-center justify-center text-purple-400">
            <Bell className="w-5 h-5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-[42px] h-[42px] rounded-full bg-amber-950/60 border border-amber-900/40 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f19] flex flex-col h-full relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="glow-orb w-[250px] h-[250px] bg-blue-600/5 top-1/4 left-1/4" />
      <div className="glow-orb w-[300px] h-[300px] bg-indigo-500/5 bottom-1/4 right-1/3" />

      {/* Header */}
      <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-400" /> Notifications
          </h1>
          <p className="text-[12px] text-slate-400 mt-1">
            Manage incoming chat requests, status updates, and alerts.
          </p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={onMarkAllRead}
              className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-[12px] font-semibold text-sky-400 hover:text-sky-300 rounded-lg border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClearAll}
              className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-[12px] font-semibold text-red-400 rounded-lg border border-red-900/20 hover:border-red-900/40 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Navigation Filter Tabs */}
      <div className="px-6 py-3 border-b border-slate-800/50 flex gap-2 z-10 bg-slate-950/20 overflow-x-auto">
        {(['all', 'requests', 'system'] as const).map((tab) => {
          const count = tab === 'all' 
            ? notifications.length 
            : notifications.filter(n => tab === 'requests' ? (n.type === 'request' || n.type === 'invite') : n.type === 'system').length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                filter === tab
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab} <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-900 text-slate-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications List Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-2xl glassmorphism-light border border-slate-800/80 hover:border-slate-700/60 transition-all duration-200 flex gap-3 sm:gap-4 ${
                !notification.isRead ? 'border-l-4 border-l-sky-500 bg-sky-950/5' : ''
              } animate-fade-in`}
            >
              {/* Icon / Avatar preview */}
              <div className="shrink-0">
                {notification.avatar ? (
                  <div className="w-[42px] h-[42px] rounded-full overflow-hidden border border-slate-700/50">
                    <img src={notification.avatar} alt={notification.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  renderIcon(notification)
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                  <h3 className="text-[13.5px] font-bold text-slate-100 truncate">
                    {notification.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">
                    {notification.timestamp}
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-400 leading-normal mb-3">
                  {notification.description}
                </p>

                {/* Accept/Decline action buttons */}
                {(notification.type === 'request' || notification.type === 'invite') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAcceptRequest(notification.id)}
                      className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-[#0b0f19] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => onDeclineRequest(notification.id)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-800 hover:border-slate-700 active:scale-95"
                    >
                      <UserX className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>

              {/* Trash/Delete Single Notification */}
              <div className="shrink-0 flex items-start">
                <button
                  onClick={() => onDeleteNotification(notification.id)}
                  className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer"
                  title="Remove Notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center select-none opacity-40">
            <Bell className="w-12 h-12 text-slate-600 mb-3" />
            <span className="text-slate-300 text-sm font-semibold mb-1">No notifications found</span>
            <span className="text-slate-400 text-xs">You're all caught up!</span>
          </div>
        )}
      </div>
    </div>
  );
};
