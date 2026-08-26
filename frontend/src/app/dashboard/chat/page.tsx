"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, formatDateTime } from "@/lib/utils";
import { useConversations, useConversation, useSendMessage, useChatSocket, useUnreadCount, type ChatMessage, type Conversation } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth-store";
import { Send, ArrowLeft, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: conversations, isLoading: convLoading } = useConversations();
  const { data: conversationData, isLoading: msgLoading } = useConversation(selectedUser || "");
  const sendMessage = useSendMessage();
  const { data: unreadData } = useUnreadCount();
  const chatSocket = useChatSocket(user?.id || null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, conversationData, scrollToBottom]);

  useEffect(() => {
    if (conversationData?.items) {
      setLocalMessages(conversationData.items);
    }
  }, [conversationData]);

  useEffect(() => {
    if (!chatSocket) return;
    const unsub = chatSocket.onNewMessage((msg) => {
      setLocalMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsub;
  }, [chatSocket]);

  useEffect(() => {
    if (!chatSocket) return;
    const unsub = chatSocket.onUserTyping((data) => {
      setTypingUsers((prev) => ({ ...prev, [data.userId]: data.isTyping }));
    });
    return unsub;
  }, [chatSocket]);

  useEffect(() => {
    if (selectedUser && chatSocket) {
      chatSocket.markAsRead(selectedUser);
    }
  }, [selectedUser, localMessages, chatSocket]);

  const handleSend = async () => {
    if (!messageText.trim() || !selectedUser) return;
    const text = messageText.trim();
    setMessageText("");

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text,
      attachments: [],
      read: false,
      createdAt: new Date().toISOString(),
      sender: { id: user?.id || "", firstName: user?.firstName || "", lastName: user?.lastName || "", avatar: user?.avatar },
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);

    if (chatSocket?.isConnected) {
      chatSocket.sendMessage(selectedUser, text);
    } else {
      try {
        await sendMessage.mutateAsync({ receiverId: selectedUser, text });
      } catch {
        setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (selectedUser && chatSocket) {
      chatSocket.emitTyping(selectedUser, messageText.length > 0);
    }
  };

  const selectedConv = conversations?.find((c) => c.user.id === selectedUser);

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card">
      {/* Conversations list */}
      <div className={`w-full border-r sm:w-80 ${selectedUser ? "hidden sm:block" : ""}`}>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            {chatSocket && (
              <div className="flex items-center gap-1 text-xs">
                {chatSocket.isConnected ? (
                  <><Wifi className="h-3 w-3 text-green-500" /><span className="text-green-600">Live</span></>
                ) : (
                  <><WifiOff className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Offline</span></>
                )}
              </div>
            )}
          </div>
          {unreadData && unreadData.unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadData.unreadCount} unread</p>
          )}
        </div>
        <div className="overflow-y-auto">
          {convLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : !conversations?.length ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet</div>
          ) : (
            conversations.map((conv: Conversation) => (
              <button
                key={conv.user.id}
                onClick={() => setSelectedUser(conv.user.id)}
                className={`flex w-full items-center gap-3 border-b p-4 text-left transition-colors hover:bg-muted/50 ${
                  selectedUser === conv.user.id ? "bg-brand-50 dark:bg-brand-950" : ""
                }`}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={conv.user.avatar || ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(`${conv.user.firstName} ${conv.user.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {conv.user.firstName} {conv.user.lastName}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.text}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex flex-1 flex-col ${!selectedUser ? "hidden sm:flex" : ""}`}>
        {selectedUser && selectedConv ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={() => setSelectedUser(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src={selectedConv.user.avatar || ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(`${selectedConv.user.firstName} ${selectedConv.user.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{selectedConv.user.firstName} {selectedConv.user.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {selectedConv.user.role?.toLowerCase()}
                  {typingUsers[selectedUser] && <span className="ml-2 text-brand-600">typing...</span>}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className={`h-10 animate-pulse rounded-xl bg-muted ${i % 2 === 0 ? "ml-auto w-2/3" : "w-2/3"}`} />)}
                </div>
              ) : localMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              ) : (
                localMessages.map((msg) => {
                  const isOwn = msg.sender.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isOwn ? "bg-brand-600 text-white" : "bg-muted"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!messageText.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="Select a conversation"
              description="Choose a conversation from the sidebar to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
}
