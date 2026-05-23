import React, { useState, useEffect } from 'react';
import { ChatListPanel } from '../../components/chat/ChatListPanel';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { WelcomePanel } from '../../components/chat/WelcomePanel';
import { AddContactModal } from '../../components/chat/AddContactModal';
import type { ChatType } from '../../components/chat/ChatListItem';
import type { MessageType } from '../../components/chat/MessageItem';
import { useGetConversationsQuery, useGetProfileQuery, useGetConversationMessagesQuery } from '../../api/chatApi';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setUser } from '../../app/authSlice';
import { useWebSocket } from '../../context/webSocketContext';

export const ChatPage: React.FC = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const [replyingToMessage, setReplyingToMessage] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: apiConversations } = useGetConversationsQuery();
  const { data: userProfile } = useGetProfileQuery();

  // Load message history from the backend using RTK query when a chat is selected
  const { data: activeChatHistory } = useGetConversationMessagesQuery(
    activeChatId || '',
    { skip: !activeChatId }
  );

  const {
    sendMessage,
    editMessage,
    deleteMessage,
    sendTyping,
    typingStatus,
    onlineUsers,
    addEventListener,
    removeEventListener,
  } = useWebSocket();

  // Save the user profile details once fetched
  useEffect(() => {
    if (userProfile) {
      dispatch(setUser({
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'
      }));
    }
  }, [userProfile, dispatch]);

  // Chat List Data (initially empty, populated via API)
  const [chats, setChats] = useState<ChatType[]>([]);
  // Messages database indexed by chatID
  const [messagesDb, setMessagesDb] = useState<Record<string, MessageType[]>>({});

  // Sync HTTP conversations list to local state
  useEffect(() => {
    if (apiConversations && currentUser && currentUser.id) {
      const mappedChats: ChatType[] = apiConversations.map((conv) => {
        const otherParticipant = conv.participant_details.find(p => p.id !== currentUser.id) || conv.participant_details[0];

        return {
          id: conv.id,
          name: otherParticipant?.name || 'Unknown User',
          avatar: otherParticipant?.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
          lastMessage: conv.last_message?.content || 'Started a conversation',
          timestamp: new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          unreadCount: 0,
          sentByMe: conv.last_message?.sender_id === currentUser.id,
          isRead: true,
          isOnline: otherParticipant?.is_online || false,
          statusText: otherParticipant?.is_online ? 'online' : `last seen ${new Date(otherParticipant?.last_seen || Date.now()).toLocaleDateString()}`
        };
      });

      setChats(prev => {
        const apiChatIds = new Set(mappedChats.map(c => c.id));
        const remainingMockChats = prev.filter(c => !apiChatIds.has(c.id));
        return [...mappedChats, ...remainingMockChats];
      });
    }
  }, [apiConversations, currentUser]);

  // Sync historical messages from RTK Query into local messages database
  useEffect(() => {
    if (activeChatHistory && activeChatId && currentUser) {
      const otherParticipant = chats.find(c => c.id === activeChatId);
      const mappedHistory: MessageType[] = activeChatHistory.map((m) => {
        const timeString = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const sentByMe = m.sender_id === currentUser.id;
        const senderName = sentByMe ? 'Me' : (otherParticipant?.name || 'Contact');

        return {
          id: m.id,
          senderId: m.sender_id,
          senderName,
          text: m.content,
          timestamp: timeString,
          sentByMe,
          parentId: m.parent_id
        };
      });

      setMessagesDb((prev) => ({
        ...prev,
        [activeChatId]: mappedHistory,
      }));
    }
  }, [activeChatHistory, activeChatId, currentUser]);

  // Real-time synchronization of online/offline status and typing indicators in the sidebar list
  useEffect(() => {
    setChats((prev) =>
      prev.map((chat) => {
        const conv = apiConversations?.find((c) => c.id === chat.id);
        if (!conv || !currentUser) return chat;
        const otherParticipant = conv.participant_details.find((p) => p.id !== currentUser.id);
        if (!otherParticipant) return chat;

        const isOnline = onlineUsers[otherParticipant.id] !== undefined
          ? onlineUsers[otherParticipant.id]
          : otherParticipant.is_online;

        const isTyping = typingStatus[chat.id]?.[otherParticipant.id] || false;

        return {
          ...chat,
          isOnline,
          isTyping,
          statusText: isOnline ? 'online' : chat.statusText
        };
      })
    );
  }, [onlineUsers, typingStatus, apiConversations, currentUser]);

  // Listen to incoming WebSocket events (new_message, edit_message, delete_message)
  useEffect(() => {
    const handleWSEvent = (response: any) => {
      if (response.event === 'new_message' && response.message) {
        const msg = response.message;
        const convId = msg.conversation_id;
        const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        const sentByMe = msg.sender_id === currentUser?.id;
        const otherParticipant = chats.find(c => c.id === convId);
        const senderName = sentByMe ? 'Me' : (otherParticipant?.name || 'Contact');

        const formattedMsg: MessageType = {
          id: msg.id,
          senderId: msg.sender_id,
          senderName,
          text: msg.content,
          timestamp: timeString,
          sentByMe,
          parentId: msg.parent_id
        };

        // Append to history
        setMessagesDb((prev) => ({
          ...prev,
          [convId]: [...(prev[convId] || []).filter(m => m.id !== formattedMsg.id), formattedMsg],
        }));

        // Update list preview
        setChats((prevChats) => {
          const idx = prevChats.findIndex(c => c.id === convId);
          if (idx === -1) return prevChats;
          const updated = [...prevChats];
          const isCurrentlyActive = activeChatId === convId;
          updated[idx] = {
            ...updated[idx],
            lastMessage: msg.content,
            timestamp: timeString,
            sentByMe,
            unreadCount: isCurrentlyActive ? 0 : (updated[idx].unreadCount + (sentByMe ? 0 : 1))
          };
          const [item] = updated.splice(idx, 1);
          updated.unshift(item);
          return updated;
        });
      }

      else if (response.event === 'edit_message' && response.message) {
        const msg = response.message;
        const convId = msg.conversation_id;

        setMessagesDb((prev) => {
          const history = prev[convId] || [];
          const updatedHistory = history.map((m) => {
            if (m.id === msg.id) {
              return { ...m, text: msg.content, isEdited: true };
            }
            return m;
          });
          return { ...prev, [convId]: updatedHistory };
        });

        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              lastMessage: msg.content
            };
          })
        );
      }

      else if (response.event === 'delete_message' && response.message_id && response.conversation_id) {
        const msgId = response.message_id;
        const convId = response.conversation_id;

        setMessagesDb((prev) => {
          const history = prev[convId] || [];
          const updatedHistory = history.filter((m) => m.id !== msgId);
          return { ...prev, [convId]: updatedHistory };
        });

        // Fetch last message from state
        setChats((prevChats) =>
          prevChats.map((c) => {
            if (c.id !== convId) return c;
            // Lookup latest message in history
            const remaining = messagesDb[convId]?.filter((m) => m.id !== msgId) || [];
            const last = remaining[remaining.length - 1];
            return {
              ...c,
              lastMessage: last ? last.text : 'No messages remaining.',
              sentByMe: last ? last.sentByMe : false
            };
          })
        );
      }
    };

    addEventListener(handleWSEvent);
    return () => {
      removeEventListener(handleWSEvent);
    };
  }, [addEventListener, removeEventListener, currentUser, chats, activeChatId, messagesDb]);

  // Automatically mark read when a chat is selected
  useEffect(() => {
    if (!activeChatId) return;

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === activeChatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  }, [activeChatId]);

  // Message Sender Logic over WebSocket
  const handleSendMessage = (text: string) => {
    if (!activeChatId) return;
    sendMessage(activeChatId, text, replyingToMessage?.id || undefined);
    setReplyingToMessage(null);
  };

  // Message Edits over WebSocket
  const handleEditMessage = (text: string) => {
    if (!editingMessage) return;
    editMessage(editingMessage.id, text);
    setEditingMessage(null);
  };

  // Message Deletions over WebSocket
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Typing status publisher over WebSocket
  const handleSendTyping = (isTyping: boolean) => {
    if (!activeChatId) return;
    sendTyping(activeChatId, isTyping);
  };

  // Reactions Logic (Toggle locally)
  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!activeChatId) return;

    setMessagesDb(prev => {
      const chatMsgs = prev[activeChatId] || [];
      const updated = chatMsgs.map(msg => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const isAlreadyAdded = currentReactions.includes(emoji);
        let nextReactions: string[] = [];

        if (emoji === '') {
          nextReactions = [];
        } else if (isAlreadyAdded) {
          nextReactions = currentReactions.filter(r => r !== emoji);
        } else {
          nextReactions = [...currentReactions.filter(r => r !== emoji), emoji].slice(-2);
        }

        return { ...msg, reactions: nextReactions };
      });

      return { ...prev, [activeChatId]: updated };
    });
  };

  // Filter & Search computation
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return chat.unreadCount > 0;
    if (activeFilter === 'favourites') return chat.isFavorite || chat.id === 'mom';
    if (activeFilter === 'groups') return chat.isGroup || chat.name.toLowerCase().includes('group') || chat.name.toLowerCase().includes('recro');

    return true;
  });

  // Handle Quick Action clicks from Welcome Panel
  const handleQuickAction = (action: string) => {
    if (action === 'add_contact') {
      setIsAddContactModalOpen(true);
    } else if (action === 'send_doc') {
      const newContactId = `chat_${Date.now()}`;
      const namePrompt = 'Upload document for:';
      const input = prompt(namePrompt, 'Arshdeep Documents');
      if (!input) return;

      const newChat: ChatType = {
        id: newContactId,
        name: input,
        avatar: '',
        lastMessage: 'Uploaded document files.',
        timestamp: 'Just Now',
        unreadCount: 0,
        sentByMe: true,
        isRead: true,
        isOnline: true,
        statusText: 'online'
      };

      setChats(prev => [newChat, ...prev]);
      setMessagesDb(prev => ({
        ...prev,
        [newContactId]: [
          {
            id: 'init_msg',
            senderId: 'me',
            senderName: 'Me',
            text: newChat.lastMessage,
            timestamp: 'Just Now',
            sentByMe: true,
            isRead: true
          }
        ]
      }));
      setActiveChatId(newContactId);
    } else if (action === 'meta_ai') {
      const newChat: ChatType = {
        id: 'meta_ai_chat',
        name: 'Meta AI 🌟',
        avatar: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=100',
        lastMessage: 'Ask me anything!',
        timestamp: '12:00',
        unreadCount: 0,
        sentByMe: false,
        isOnline: true,
        statusText: 'AI Assistant'
      };

      setChats(prev => {
        if (prev.some(c => c.id === 'meta_ai_chat')) return prev;
        return [newChat, ...prev];
      });

      setMessagesDb(prev => {
        if (prev['meta_ai_chat']) return prev;
        return {
          ...prev,
          meta_ai_chat: [
            {
              id: 'meta_init',
              senderId: 'meta_ai_chat',
              senderName: 'Meta AI',
              text: 'Hello! I am Meta AI, built into this Navy Blue dashboard. How can I help you today?',
              timestamp: '12:00',
              sentByMe: false
            }
          ]
        };
      });
      setActiveChatId('meta_ai_chat');
    } else if (action === 'download') {
      alert('Downloading ChatApp installer for Windows (mock-up)...');
    }
  };

  const handleStartNewChat = () => {
    handleQuickAction('add_contact');
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeMessages = activeChatId ? messagesDb[activeChatId] || [] : [];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-6 right-6 bg-[#0b0f19]/90 text-sky-400 px-5 py-3 rounded-2xl text-xs font-bold shadow-[0_0_40px_rgba(14,165,233,0.3)] z-[100] animate-fade-in flex items-center gap-3 border border-sky-500/30 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
          </span>
          {toastMessage}
        </div>
      )}

      {/* Add Contact Modal */}
      <AddContactModal 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)} 
        onRequestSuccess={() => showToast('request is send wait for there response')}
      />

      {/* Left List of Chats */}
      <div className={`h-full shrink-0 ${activeChatId ? 'hidden md:block' : 'w-full md:w-auto'}`}>
        <ChatListPanel
          chats={filteredChats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddChatClick={handleStartNewChat}
        />
      </div>

      {/* Right active chat box OR welcome window */}
      <div className={`flex-1 overflow-hidden h-full ${!activeChatId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
        {activeChatId && activeChat ? (
          <ChatWindow
            chat={activeChat}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onReact={handleReactToMessage}
            onDeleteMessage={handleDeleteMessage}
            onSendTyping={handleSendTyping}
            replyingToMessage={replyingToMessage}
            onSelectReply={setReplyingToMessage}
            editingMessage={editingMessage}
            onSelectEdit={setEditingMessage}
            onEditMessage={handleEditMessage}
            onBack={() => setActiveChatId(null)}
          />
        ) : (
          <WelcomePanel onQuickAction={handleQuickAction} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
