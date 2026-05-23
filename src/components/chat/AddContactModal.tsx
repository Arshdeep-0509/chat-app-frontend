import React, { useState, useMemo } from 'react';
import { X, Search, UserPlus, Loader2, Check } from 'lucide-react';
import { useGetUsersQuery, useSendChatRequestMutation } from '../../api/chatApi';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSuccess: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onRequestSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const { data: users = [], isLoading, isError } = useGetUsersQuery(undefined, { skip: !isOpen });
  const [sendRequest, { isLoading: isSending }] = useSendChatRequestMutation();

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Filter pending users and apply local search
  const displayedUsers = useMemo(() => {
    return users
      .filter((u) => u.request_status === 'pending')
      .filter((u) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      });
  }, [users, searchQuery]);

  if (!isOpen) return null;

  const handleSendRequest = async (userId: string) => {
    try {
      setLoadingUserId(userId);
      await sendRequest({ receiver_id: userId }).unwrap();
      // On success, mark locally as sent
      setSentRequests((prev) => new Set(prev).add(userId));
      onRequestSuccess();
    } catch (error) {
      console.error('Failed to send request:', error);
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-[#0b0f19]/95 border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden glassmorphism">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800/80 bg-slate-900/30">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-400" />
            Add Contacts
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/50 bg-slate-900/20">
          <div className="relative flex items-center bg-slate-900/80 rounded-xl border border-slate-800/80 focus-within:border-sky-500/50 transition-all duration-200">
            <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-transparent text-[13px] text-slate-200 placeholder-slate-500 border-none outline-none focus:ring-0"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-32 text-red-400 text-sm font-medium">
              Failed to load users
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 border border-slate-700/50">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-slate-300 text-sm font-semibold mb-1">No pending contacts</span>
              <span className="text-slate-500 text-xs">Try a different search term</span>
            </div>
          ) : (
            displayedUsers.map((user) => {
              const isSent = sentRequests.has(user.id);
              const isLoadingThis = loadingUserId === user.id;

              return (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-slate-700">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-200 truncate">{user.name}</span>
                      <span className="text-xs text-slate-500 truncate">@{user.username}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={isSent || isLoadingThis}
                    className={`ml-3 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                      isSent
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 shadow-none cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-[#0b0f19] border-transparent hover:shadow-sky-500/20'
                    }`}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSent ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Sent
                      </>
                    ) : (
                      'Request'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
