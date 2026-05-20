import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAppSelector } from '../hooks/redux';
import type { WSRequest, WSResponse } from '../api/chatApi';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (conversationId: string, content: string, parentId?: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  typingStatus: Record<string, Record<string, boolean>>; // { [convId]: { [userId]: typing } }
  onlineUsers: Record<string, boolean>; // { [userId]: online }
  addEventListener: (listener: (event: WSResponse) => void) => void;
  removeEventListener: (listener: (event: WSResponse) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAppSelector((state) => state.auth.token);
  const [isConnected, setIsConnected] = useState(false);
  const [typingStatus, setTypingStatus] = useState<Record<string, Record<string, boolean>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<(event: WSResponse) => void>>(new Set());
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectDelayRef = useRef<number>(1000); // Start at 1s

  const addEventListener = useCallback((listener: (event: WSResponse) => void) => {
    listenersRef.current.add(listener);
  }, []);

  const removeEventListener = useCallback((listener: (event: WSResponse) => void) => {
    listenersRef.current.delete(listener);
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!token) return;

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.close();
    }

    const wsUrl = `ws://localhost:8080/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectDelayRef.current = 1000; // Reset reconnect delay on success
    };

    ws.onmessage = (event) => {
      try {
        const response: WSResponse = JSON.parse(event.data);
        console.log('WebSocket received event:', response);

        // Handle specific states in Context
        if (response.event === 'typing' && response.conversation_id && response.user_id) {
          setTypingStatus((prev) => ({
            ...prev,
            [response.conversation_id!]: {
              ...(prev[response.conversation_id!] || {}),
              [response.user_id!]: !!response.is_typing,
            },
          }));
        } else if (response.event === 'user_status' && response.user_id) {
          setOnlineUsers((prev) => ({
            ...prev,
            [response.user_id!]: !!response.is_online,
          }));
        }

        // Notify all registered listeners
        listenersRef.current.forEach((listener) => {
          try {
            listener(response);
          } catch (e) {
            console.error('Error in WebSocket listener callback:', e);
          }
        });
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      if (socketRef.current !== ws) {
        console.log('Obsolete socket closed, ignoring reconnect');
        return;
      }
      setIsConnected(false);
      socketRef.current = null;

      // Attempt reconnection if token is still available
      if (token) {
        const delay = reconnectDelayRef.current;
        console.log(`Attempting reconnect in ${delay}ms`);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000); // max 30s
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (socketRef.current === ws) {
        ws.close();
      }
    };
  }, [token]);

  // Handle connection state based on token
  useEffect(() => {
    if (token) {
      connect();
    } else {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
      }
      setIsConnected(false);
      setTypingStatus({});
      setOnlineUsers({});
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
      }
    };
  }, [token, connect]);

  // Client Actions
  const sendMessage = useCallback((conversationId: string, content: string, parentId?: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    const payload: WSRequest = {
      event: 'send_message',
      conversation_id: conversationId,
      content,
      parent_id: parentId,
    };
    socketRef.current.send(JSON.stringify(payload));
  } ,[]);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    const payload: WSRequest = {
      event: 'edit_message',
      message_id: messageId,
      content,
    };
    socketRef.current.send(JSON.stringify(payload));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    const payload: WSRequest = {
      event: 'delete_message',
      message_id: messageId,
    };
    socketRef.current.send(JSON.stringify(payload));
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    const payload: WSRequest = {
      event: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping,
    };
    socketRef.current.send(JSON.stringify(payload));
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        editMessage,
        deleteMessage,
        sendTyping,
        typingStatus,
        onlineUsers,
        addEventListener,
        removeEventListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
