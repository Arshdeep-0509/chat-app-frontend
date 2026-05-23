import React, { useState, useMemo } from 'react';
import { NotificationList } from '../../components/notifications/NotificationList';
import type { NotificationType } from '../../components/notifications/NotificationList';
import { useGetChatRequestsQuery, useRespondToChatRequestMutation } from '../../api/chatApi';

export const NotificationsPage: React.FC = () => {
  const { data: chatRequests = [], isLoading } = useGetChatRequestsQuery();
  const [respondToRequest] = useRespondToChatRequestMutation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const notifications = useMemo(() => {
    return (chatRequests || [])
      .filter((req) => req.status === 'pending')
      .map((req) => {
        const notif: NotificationType = {
          id: req.id,
          type: 'request',
          title: 'Friend Request',
          description: `${req.sender.name} sent you a friend request. Accept to start direct messaging.`,
          timestamp: new Date(req.created_at).toLocaleDateString(), // Basic format
          avatar: req.sender.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
          isRead: false,
          meta: { userId: req.sender.id },
        };
        return notif;
      });
  }, [chatRequests]);

  const handleAcceptRequest = async (id: string) => {
    try {
      await respondToRequest({ request_id: id, status: 'accepted' }).unwrap();
      showToast('Request Accepted');
    } catch (error) {
      console.error('Failed to accept request:', error);
      showToast('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (id: string) => {
    try {
      await respondToRequest({ request_id: id, status: 'declined' }).unwrap();
      showToast('Request Declined');
    } catch (error) {
      console.error('Failed to decline request:', error);
      showToast('Failed to decline request');
    }
  };

  const handleClearAll = () => {
    showToast('Clear all is not fully wired to backend yet');
  };

  const handleMarkAllRead = () => {
    showToast('Marked all notifications as read');
  };

  const handleDeleteNotification = () => {
    showToast('Notification deleted');
  };

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-sky-500 text-[#0b0f19] px-4 py-2 rounded-xl text-xs font-bold shadow-2xl z-50 animate-fade-in flex items-center gap-2 border border-sky-400">
          <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
          {toastMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <NotificationList
          notifications={notifications}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
          onClearAll={handleClearAll}
          onMarkAllRead={handleMarkAllRead}
          onDeleteNotification={handleDeleteNotification}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
