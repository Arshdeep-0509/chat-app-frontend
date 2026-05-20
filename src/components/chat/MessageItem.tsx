import React, { useState } from 'react';
import { Check, CheckCheck, Smile, ChevronDown, Trash2, Copy, CornerUpLeft, Edit2 } from 'lucide-react';

export interface MessageType {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  sentByMe: boolean;
  isRead?: boolean;
  reactions?: string[];
  linkPreview?: {
    title: string;
    description: string;
    domain: string;
    url: string;
    image?: string;
  };
  parentId?: string;
  isEdited?: boolean;
}

interface MessageItemProps {
  message: MessageType;
  onReact: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  parentMessage?: MessageType;
  onReplyClick?: (messageId: string) => void;
  onSelectReply?: (message: MessageType) => void;
  onSelectEdit?: (message: MessageType) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onReact,
  onDelete,
  parentMessage,
  onReplyClick,
  onSelectReply,
  onSelectEdit
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const emojiList = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.text);
    setShowOptions(false);
  };

  const renderStatus = () => {
    if (!message.sentByMe) return null;
    if (message.isRead) {
      return <CheckCheck className="w-3.5 h-3.5 text-sky-400" />;
    }
    return <Check className="w-3.5 h-3.5 text-slate-500" />;
  };

  const renderLinkPreview = () => {
    const preview = message.linkPreview;
    if (!preview) return null;

    return (
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1.5 mb-1.5 rounded-lg overflow-hidden bg-slate-950/40 border border-slate-800/80 hover:bg-slate-950/60 transition-colors select-none"
      >
        <div className="flex">
          {preview.image && (
            <div className="w-[80px] shrink-0 border-r border-slate-800/80">
              <img src={preview.image} alt={preview.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-2.5 min-w-0">
            <span className="text-[10px] text-sky-400 font-semibold tracking-wider block uppercase mb-0.5">
              {preview.domain}
            </span>
            <h4 className="text-[12.5px] font-semibold text-slate-200 truncate mb-1">
              {preview.title}
            </h4>
            <p className="text-[11.5px] text-slate-400 line-clamp-2 leading-tight">
              {preview.description}
            </p>
          </div>
        </div>
      </a>
    );
  };

  return (
    <div
      id={message.id}
      className={`flex w-full mb-3 px-4 relative group ${
        message.sentByMe ? 'justify-end animate-slide-in' : 'justify-start animate-fade-in'
       }`}
      onMouseLeave={() => {
        setShowReactions(false);
        setShowOptions(false);
      }}
    >
      {/* Hover Message Actions Panel */}
      <div
        className={`absolute -top-7 ${
          message.sentByMe ? 'right-4' : 'left-4'
        } z-30 flex items-center bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl`}
      >
        {/* Reaction picker icon */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className="p-1 text-slate-400 hover:text-sky-400 rounded-full cursor-pointer hover:bg-slate-800/50"
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {/* Action dropdown toggle */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-1 text-slate-400 hover:text-sky-400 rounded-full cursor-pointer hover:bg-slate-800/50"
          title="More options"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating Reaction Bar */}
      {showReactions && (
        <div
          className={`absolute -top-9 ${
            message.sentByMe ? 'right-16' : 'left-16'
          } z-40 flex bg-slate-950 border border-slate-800 rounded-full px-1.5 py-1 shadow-2xl animate-fade-in gap-1.5`}
        >
          {emojiList.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onReact(message.id, emoji);
                setShowReactions(false);
              }}
              className="text-[15px] hover:scale-130 transition-transform cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Bubble options context menu */}
      {showOptions && (
        <div
          className={`absolute top-6 ${
            message.sentByMe ? 'right-4' : 'left-4'
          } z-40 bg-slate-950 border border-slate-800 rounded-xl p-1.5 flex flex-col gap-1 shadow-2xl w-[120px] animate-fade-in`}
        >
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-slate-200 text-xs w-full cursor-pointer text-left font-medium"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            Copy Text
          </button>
          {onSelectReply && (
            <button
              onClick={() => {
                onSelectReply(message);
                setShowOptions(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-slate-200 text-xs w-full cursor-pointer text-left font-medium"
            >
              <CornerUpLeft className="w-3.5 h-3.5 text-slate-400" />
              Reply
            </button>
          )}
          {message.sentByMe && onSelectEdit && (
            <button
              onClick={() => {
                onSelectEdit(message);
                setShowOptions(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-300 hover:text-slate-200 text-xs w-full cursor-pointer text-left font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete(message.id);
                setShowOptions(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-red-950/30 text-red-400/80 hover:text-red-400 text-xs w-full cursor-pointer text-left font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500/60" />
              Delete
            </button>
          )}
        </div>
      )}

      {/* Actual Message Bubble */}
      <div
        className={`max-w-[70%] md:max-w-[60%] rounded-2xl px-3.5 py-2 relative shadow-md transition-all duration-200 border ${
          message.sentByMe
            ? 'bg-sky-950/40 text-sky-100 border-sky-900/30 rounded-tr-none'
            : 'bg-slate-900/90 text-slate-200 border-slate-800/80 rounded-tl-none'
        }`}
      >
        {/* Replying Preview Header */}
        {parentMessage && (
          <div 
            onClick={() => onReplyClick?.(parentMessage.id)}
            className="mb-1.5 p-2 bg-slate-950/50 border-l-2 border-sky-400 rounded-r-lg text-left cursor-pointer hover:bg-slate-950 transition-colors"
          >
            <span className="text-[10px] font-bold text-sky-400 block mb-0.5 uppercase tracking-wider">
              Replying to {parentMessage.sentByMe ? 'You' : parentMessage.senderName}
            </span>
            <p className="text-[11.5px] text-slate-400 truncate leading-normal">
              {parentMessage.text}
            </p>
          </div>
        )}

        {/* Group Sender Name */}
        {!message.sentByMe && message.senderName && (
          <span className="text-[11px] font-bold text-sky-400 block mb-0.5 tracking-wide">
            {message.senderName}
          </span>
        )}

        {/* Link previews */}
        {renderLinkPreview()}

        {/* Message Text */}
        <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap select-text pr-4">
          {message.text}
        </p>

        {/* Timestamp & Status Icon */}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 float-right leading-none select-none">
          {message.isEdited && <span className="text-[9px] text-slate-400 font-semibold uppercase mr-1">(edited)</span>}
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>

        {/* Pinned Reactions Overlay */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`absolute -bottom-2.5 ${
              message.sentByMe ? 'left-3' : 'right-3'
            } flex items-center bg-[#0f172a] border border-slate-800/80 rounded-full px-1.5 py-0.5 shadow-sm text-xs select-none cursor-pointer hover:bg-slate-800`}
            onClick={() => onReact(message.id, '')} // click to remove
            title="Click to remove reaction"
          >
            {message.reactions.map((react, idx) => (
              <span key={idx} className="mr-0.5 last:mr-0 text-[11px]">
                {react}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
