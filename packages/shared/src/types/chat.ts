export interface IChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  orderId?: string;
  text: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

export interface IChatConversation {
  id: string;
  participants: string[];
  orderId?: string;
  lastMessage?: IChatMessage;
  unreadCount: number;
  createdAt: string;
}
