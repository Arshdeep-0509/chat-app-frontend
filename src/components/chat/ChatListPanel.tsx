import React from 'react';
import { Search, SquarePen, MoreVertical } from 'lucide-react';
import { ChatListItem } from './ChatListItem';
import type { ChatType } from './ChatListItem';

interface ChatListPanelProps {
  chats: ChatType[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  activeFilter?: string;
  setActiveFilter?: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddChatClick?: () => void;
}

export const ChatListPanel: React.FC<ChatListPanelProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  // activeFilter,
  // setActiveFilter,
  searchQuery,
  setSearchQuery,
  onAddChatClick
}) => {
  // const filters = ['All', 'Unread', 'Favourites', 'Groups'];

  return (
    <div className="w-full md:w-[340px] lg:w-[380px] bg-[#0f172a] border-r border-slate-800/80 flex flex-col shrink-0 h-full relative">
      {/* Top Header */}
      <div className="p-4 flex justify-between items-center select-none">
        <h1 className="text-xl font-bold text-sky-400 flex items-center gap-1 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
          ChatApp
        </h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={onAddChatClick}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="New Chat"
          >
            <SquarePen className="w-5 h-5" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer" title="Menu">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-3">
        <div className="relative flex items-center bg-slate-900/90 rounded-xl border border-slate-800/80 focus-within:border-sky-500/50 transition-all duration-200">
          <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search or start a new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-transparent text-[13px] text-slate-200 placeholder-slate-500 border-none outline-none focus:ring-0 focus:ring-offset-0"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-500 hover:text-slate-300 text-xs font-semibold px-1 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      {/* 
      <div className="px-4 pb-3 flex items-center gap-1.5 select-none overflow-x-auto no-scrollbar">
        {filters.map((filter) => {
          const isActive = activeFilter.toLowerCase() === filter.toLowerCase();
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter.toLowerCase())}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/50 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
      */}

      {/* Archived Shortcut */}
      {/* 
      <div className="mx-4 my-1.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-800/30 transition-all duration-200 cursor-pointer flex justify-between items-center select-none group">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded bg-slate-800 text-sky-400 group-hover:bg-slate-700 transition-colors">
            <Archive className="w-4 h-4" />
          </div>
          <span className="text-[13px] text-slate-300 font-medium">Archived</span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
          43
        </span>
      </div>
      */}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-0.5 pb-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center select-none">
            <span className="text-slate-500 text-sm font-medium mb-1">No chats found</span>
            <span className="text-slate-600 text-xs">Try starting a new conversation or checking your search terms.</span>
          </div>
        )}
      </div>
    </div>
  );
};
