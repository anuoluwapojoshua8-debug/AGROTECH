"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { io, Socket } from "socket.io-client";
import { API_URL } from "@/config/constants";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export interface ChatMessage {
  id: string;
  text: string;
  attachments: string[];
  read: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatar?: string };
}

export interface Conversation {
  user: { id: string; firstName: string; lastName: string; avatar?: string; role: string };
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await apiClient.get("/chat/conversations");
      return unwrap<Conversation[]>(res);
    },
  });
}

export function useConversation(userId: string, page = 1) {
  return useQuery({
    queryKey: ["conversation", userId, page],
    queryFn: async () => {
      const res = await apiClient.get(`/chat/conversations/${userId}?page=${page}&limit=50`);
      return unwrap<{ items: ChatMessage[]; meta: { total: number; page: number; hasNext: boolean } }>(res);
    },
    enabled: !!userId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { receiverId: string; text: string; orderId?: string }) => {
      const res = await apiClient.post("/chat/send", data);
      return unwrap<ChatMessage>(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["chat-unread"],
    queryFn: async () => {
      const res = await apiClient.get("/chat/unread-count");
      return unwrap<{ unreadCount: number }>(res);
    },
    refetchInterval: 30000,
  });
}

export function useChatSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!userId || socketRef.current?.connected) return;

    const socket = io(`${API_URL}/chat`, {
      query: { userId },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socketRef.current = socket;
  }, [userId]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback(
    (receiverId: string, text: string, orderId?: string) => {
      if (!socketRef.current) return;
      socketRef.current.emit("sendMessage", { receiverId, text, orderId });
    },
    []
  );

  const markAsRead = useCallback((senderId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("markAsRead", { senderId });
  }, []);

  const emitTyping = useCallback((receiverId: string, isTyping: boolean) => {
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { receiverId, isTyping });
  }, []);

  const onNewMessage = useCallback((callback: (message: ChatMessage) => void) => {
    socketRef.current?.on("newMessage", callback);
    return () => {
      socketRef.current?.off("newMessage", callback);
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    socketRef.current?.on("userTyping", callback);
    return () => {
      socketRef.current?.off("userTyping", callback);
    };
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, sendMessage, markAsRead, emitTyping, onNewMessage, onUserTyping, socket: socketRef.current };
}
