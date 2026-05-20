import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export interface ChatType {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup?: boolean;
  isFavorite?: boolean;
  isOnline?: boolean;
  isTyping?: boolean;
  statusText?: string;
  sentByMe?: boolean;
  isRead?: boolean;
  reactionSummary?: {
    emoji: string;
    messagePreview: string;
  };
}

interface ChatListItemProps {
  chat: ChatType;
  isActive: boolean;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  const renderMessageStatus = () => {
    if (!chat.sentByMe) return null;
    if (chat.isRead) {
      return <CheckCheck className="w-4 h-4 text-sky-400 shrink-0 mr-1" />;
    }
    return <Check className="w-4 h-4 text-slate-500 shrink-0 mr-1" />;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-xl cursor-pointer select-none transition-all duration-150 ${
        isActive
          ? 'bg-slate-800/90 text-white shadow-md shadow-slate-950/20'
          : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100'
      }`}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0 select-none">
        <div className="w-[48px] h-[48px] rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-700/50">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold uppercase">{chat.name.substring(0, 2)}</span>
          )}
        </div>
        
        {/* Online Badge */}
        {chat.isOnline && (
          <span className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] bg-emerald-500 border-2 border-[#0f172a] rounded-full" />
        )}
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[42px]">
        <div className="flex items-baseline justify-between">
          <h3 className={`text-[14px] font-medium truncate leading-tight ${isActive ? 'text-white font-semibold' : 'text-slate-200'}`}>
            {chat.name}
          </h3>
          <span className={`text-[11px] shrink-0 leading-none ${chat.unreadCount > 0 && !isActive ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
            {chat.timestamp}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {chat.isTyping ? (
            <span className="text-[12px] text-emerald-400 font-medium truncate animate-pulse">
              typing...
            </span>
          ) : chat.reactionSummary ? (
            <span className="text-[12px] text-slate-400 truncate flex items-center gap-1">
              You reacted {chat.reactionSummary.emoji} to: "{chat.reactionSummary.messagePreview}"
            </span>
          ) : (
            <div className="flex items-center text-[12px] text-slate-400 truncate flex-1 mr-2">
              {renderMessageStatus()}
              <span className="truncate">{chat.lastMessage}</span>
            </div>
          )}

          {/* Unread badge */}
          {chat.unreadCount > 0 && !isActive && (
            <span className="shrink-0 bg-emerald-500 text-[#0b0f19] text-[10px] font-bold h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
