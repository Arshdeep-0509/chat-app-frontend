import React, { useRef, useEffect } from 'react';
import { Video, Search, MoreVertical, Phone, ArrowLeft } from 'lucide-react';
import { MessageItem } from './MessageItem';
import type { MessageType } from './MessageItem';
import { MessageInput } from './MessageInput';
import type { ChatType } from './ChatListItem';

interface ChatWindowProps {
  chat: ChatType;
  messages: MessageType[];
  onSendMessage: (text: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onSendTyping?: (isTyping: boolean) => void;
  replyingToMessage: MessageType | null;
  onSelectReply: (message: MessageType | null) => void;
  editingMessage: MessageType | null;
  onSelectEdit: (message: MessageType | null) => void;
  onEditMessage: (text: string) => void;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  onReact,
  onDeleteMessage,
  onSendTyping,
  replyingToMessage,
  onSelectReply,
  editingMessage,
  onSelectEdit,
  onEditMessage,
  onBack,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll on message change
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  // Scroll on load/mount
  useEffect(() => {
    scrollToBottom('auto');
  }, [chat.id]);

  const handleReplyClick = (parentId: string) => {
    const el = document.getElementById(parentId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add brief highlight effect to target element
      el.classList.add('bg-sky-500/10');
      setTimeout(() => {
        el.classList.remove('bg-sky-500/10');
      }, 1500);
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f19] flex flex-col justify-between h-full relative overflow-hidden select-none border-l border-slate-900">
      
      {/* Background Graphic Watermark */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.148 0 5.7-2.552 5.7-5.7 0-3.148-2.552-5.7-5.7-5.7-3.148 0-5.7 2.552-5.7 5.7 0 3.148 2.552 5.7 5.7 5.7zm50 12c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 50c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm10 17c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm66 10c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-33 25c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-40-8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm66 3c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-33 25c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-40-8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm66 3c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-33 25c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-40-8c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm66 3c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-33 25c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Header Panel */}
      <div className="h-[60px] bg-[#0c1220]/95 border-b border-slate-800/80 px-4 flex justify-between items-center z-10 shrink-0">
        
        {/* Left Side User Details */}
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-1.5 -ml-1 mr-0.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative shrink-0">
            <div className="w-[40px] h-[40px] rounded-full bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-700/50">
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold uppercase">{chat.name.substring(0, 2)}</span>
              )}
            </div>
            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 w-[10px] h-[10px] bg-emerald-500 border-2 border-[#0c1220] rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            <h2 className="text-[14px] font-bold text-slate-100 truncate leading-tight">
              {chat.name}
            </h2>
            <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5 animate-fade-in">
              {chat.isTyping ? (
                <span className="text-emerald-400 font-semibold animate-pulse">typing...</span>
              ) : chat.isOnline ? (
                'Online'
              ) : (
                chat.statusText || 'offline'
              )}
            </span>
          </div>
        </div>

        {/* Right Side Control Buttons */}
        <div className="flex items-center gap-1">
          <button 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Video Call"
          >
            <Video className="w-[20px] h-[20px]" />
          </button>
          <button 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Voice Call"
          >
            <Phone className="w-[18px] h-[18px]" />
          </button>
          <div className="w-px h-5 bg-slate-800 mx-1 shrink-0" />
          <button 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Search Messages"
          >
            <Search className="w-[19px] h-[19px]" />
          </button>
          <button 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Menu"
          >
            <MoreVertical className="w-[19px] h-[19px]" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Panel */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4 space-y-1 relative z-10"
      >
        {messages.length > 0 ? (
          messages.map((message) => {
            const parentMessage = message.parentId
              ? messages.find((m) => m.id === message.parentId)
              : undefined;
            return (
              <MessageItem
                key={message.id}
                message={message}
                onReact={onReact}
                onDelete={onDeleteMessage}
                parentMessage={parentMessage}
                onReplyClick={handleReplyClick}
                onSelectReply={onSelectReply}
                onSelectEdit={onSelectEdit}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none opacity-40">
            <span className="text-slate-300 text-sm font-semibold mb-1">No messages yet</span>
            <span className="text-slate-400 text-xs">Send a message to start the conversation!</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Panel */}
      <MessageInput 
        onSendMessage={onSendMessage} 
        onSendTyping={onSendTyping}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => onSelectReply(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => onSelectEdit(null)}
        onEditMessage={onEditMessage}
      />
    </div>
  );
};
