import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly onlineUsers = new Map<string, string[]>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.userId = userId;
      client.join(`user_${userId}`);

      const existing = this.onlineUsers.get(userId) || [];
      existing.push(client.id);
      this.onlineUsers.set(userId, existing);

      this.logger.log(`User ${userId} connected via socket`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const existing = this.onlineUsers.get(client.userId) || [];
      const filtered = existing.filter((id) => id !== client.id);
      if (filtered.length === 0) {
        this.onlineUsers.delete(client.userId);
      } else {
        this.onlineUsers.set(client.userId, filtered);
      }
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    if (!client.userId) return { event: 'error', data: 'Not authenticated' };

    const message = await this.chatService.sendMessage(client.userId, dto);

    this.server.to(`user_${dto.receiverId}`).emit('newMessage', message);
    this.server.to(`user_${client.userId}`).emit('newMessage', message);

    return { event: 'messageSent', data: message };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { senderId: string },
  ) {
    if (!client.userId) return { event: 'error', data: 'Not authenticated' };

    await this.chatService.markAsRead(client.userId, data.senderId);

    this.server.to(`user_${data.senderId}`).emit('messagesRead', {
      readBy: client.userId,
    });

    return { event: 'markedAsRead' };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;

    this.server.to(`user_${data.receiverId}`).emit('userTyping', {
      userId: client.userId,
      isTyping: data.isTyping,
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }
}
