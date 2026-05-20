import React, { useState, useRef, useEffect } from 'react';
import { Smile, Plus, Mic, Send, Image, File, User, Camera, CornerUpLeft, Edit2, X } from 'lucide-react';
import type { MessageType } from './MessageItem';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendTyping?: (isTyping: boolean) => void;
  replyingToMessage?: MessageType | null;
  onCancelReply?: () => void;
  editingMessage?: MessageType | null;
  onCancelEdit?: () => void;
  onEditMessage?: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendTyping,
  replyingToMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onEditMessage,
}) => {
  const [text, setText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastEmitTimeRef = useRef<number>(0);

  // Sync editing message text
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    } else {
      setText('');
    }
  }, [editingMessage]);

  // Clean up typing timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (!onSendTyping) return;

    const now = Date.now();
    // Emit typing true if starting typing or 2.5s since last emit
    if (!isTypingRef.current || now - lastEmitTimeRef.current > 2500) {
      isTypingRef.current = true;
      lastEmitTimeRef.current = now;
      onSendTyping(true);
    }

    // Reset typing status after 3s of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      onSendTyping(false);
    }, 3000);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    // Clear typing indicators
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && onSendTyping) {
      isTypingRef.current = false;
      onSendTyping(false);
    }

    if (editingMessage && onEditMessage) {
      onEditMessage(text.trim());
    } else {
      onSendMessage(text.trim());
    }
    setText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const attachItems = [
    { icon: Image, label: 'Photos & Videos', color: 'text-indigo-400 bg-indigo-950/50 hover:bg-indigo-950 border-indigo-900/30' },
    { icon: Camera, label: 'Camera', color: 'text-pink-400 bg-pink-950/50 hover:bg-pink-950 border-pink-900/30' },
    { icon: File, label: 'Document', color: 'text-blue-400 bg-blue-950/50 hover:bg-blue-950 border-blue-900/30' },
    { icon: User, label: 'Contact', color: 'text-emerald-400 bg-emerald-950/50 hover:bg-emerald-950 border-emerald-900/30' },
  ];

  return (
    <div className="px-4 py-3 bg-[#0c1220]/90 border-t border-slate-800/80 flex items-center gap-3 relative select-none shrink-0">
      
      {/* Replying/Editing Preview Header Banner */}
      {(replyingToMessage || editingMessage) && (
        <div className="absolute bottom-[100%] left-0 right-0 bg-[#0e1726] border-t border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30 animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            {replyingToMessage ? (
              <>
                <div className="p-1.5 rounded bg-sky-950 text-sky-400">
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-sky-400 block uppercase tracking-wider">
                    Replying to {replyingToMessage.sentByMe ? 'You' : replyingToMessage.senderName}
                  </span>
                  <p className="text-[11.5px] text-slate-400 truncate">
                    {replyingToMessage.text}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-1.5 rounded bg-amber-950/40 text-amber-400">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">
                    Editing message
                  </span>
                  <p className="text-[11.5px] text-slate-400 truncate">
                    {editingMessage!.text}
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={replyingToMessage ? onCancelReply : onCancelEdit}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Plus/Attachment Button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
            showAttachMenu ? 'bg-sky-500/20 text-sky-400 rotate-45' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
          }`}
          title="Attach"
        >
          <Plus className="w-5 h-5 transition-transform duration-200" />
        </button>

        {/* Attachment Popup Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-[52px] left-0 bg-[#0f172a] border border-slate-800 shadow-2xl rounded-2xl p-2 flex flex-col gap-1 w-[200px] z-50 animate-fade-in">
            {attachItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setShowAttachMenu(false)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-800/50 text-[12.5px] font-medium text-slate-300 hover:text-slate-100 transition-colors text-left cursor-pointer"
                >
                  <div className={`p-1.5 rounded-lg border ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Emoji Button */}
      <button
        className="p-2 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors cursor-pointer"
        title="Emojis"
        onClick={() => setText(prev => prev + '😊')}
      >
        <Smile className="w-5 h-5" />
      </button>

      {/* Message Input Box */}
      <div className="flex-1 relative flex items-center bg-slate-900 rounded-xl border border-slate-800/80 focus-within:border-sky-500/50 transition-all duration-200">
        <input
          type="text"
          placeholder={editingMessage ? "Edit your message" : "Type a message"}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="w-full px-4 py-2.5 bg-transparent text-[13.5px] text-slate-200 placeholder-slate-500 border-none outline-none focus:ring-0 focus:ring-offset-0"
        />
      </div>

      {/* Send/Mic Button */}
      <div className="w-[42px] h-[42px] flex items-center justify-center shrink-0">
        {text.trim() ? (
          <button
            onClick={handleSend}
            className="p-3 bg-sky-500 hover:bg-sky-400 text-[#0b0f19] rounded-xl shadow-md transition-all duration-150 active:scale-90 cursor-pointer"
            title="Send"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        ) : (
          <button
            className="p-2.5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 rounded-xl transition-all duration-150 cursor-pointer"
            title="Record Voice"
            onClick={() => setText('🎙️ [Voice Memo Recording...]')}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
