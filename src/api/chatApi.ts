import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_BASE_API || 'http://localhost:8080/api';

export interface ParticipantDetail {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  is_online?: boolean;
  last_seen?: string;
  blocked_users?: string[];
  created_at?: string;
  updated_at?: string;
  request_status?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: number; // Epoch milliseconds (e.g., 1716202422000)
  parent_id?: string; // Optional: Present if this message is a reply
}

export interface WSRequest {
  event: 'send_message' | 'typing' | 'edit_message' | 'delete_message';
  conversation_id?: string;
  message_id?: string;
  content?: string;
  is_typing?: boolean;
  parent_id?: string; // Set this when replying to a message
}

export interface WSResponse {
  event: 'new_message' | 'typing' | 'edit_message' | 'delete_message' | 'user_status';
  conversation_id?: string;
  message_id?: string;
  user_id?: string;
  content?: string;
  is_typing?: boolean;
  is_online: boolean; // Used for "user_status" event
  message?: Message;  // Present on "new_message" and "edit_message"
}

export interface Conversation {
  id: string;
  participants: string[];
  created_at: number;
  updated_at: number;
  participant_details: ParticipantDetail[];
  last_message?: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: number;
  };
}

export interface ChatRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: number;
  updated_at: number;
  sender: ParticipantDetail;
}

export interface RespondRequestInput {
  request_id: string;
  status: 'accepted' | 'declined';
}

export interface SendChatRequestInput {
  receiver_id: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Conversation', 'ChatRequest', 'User'],
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => '/conversations',
      providesTags: ['Conversation'],
    }),
    getChatRequests: builder.query<ChatRequest[], void>({
      query: () => '/chat-requests',
      providesTags: ['ChatRequest'],
    }),
    respondToChatRequest: builder.mutation<void, RespondRequestInput>({
      query: (body) => ({
        url: '/chat-requests/respond',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversation', 'ChatRequest'],
    }),
    getProfile: builder.query<ParticipantDetail, void>({
      query: () => '/users/profile',
    }),
    getConversationMessages: builder.query<Message[], string>({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
    }),
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    sendChatRequest: builder.mutation<{ message: string; chat_request: ChatRequest }, SendChatRequestInput>({
      query: (body) => ({
        url: '/chat-requests/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'ChatRequest'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetChatRequestsQuery,
  useRespondToChatRequestMutation,
  useGetProfileQuery,
  useGetConversationMessagesQuery,
  useGetUsersQuery,
  useSendChatRequestMutation,
} = chatApi;

export default chatApi;
