import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(senderId: string, dto: SendMessageDto) {
    const receiver = await this.prisma.user.findUnique({ where: { id: dto.receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');

    if (dto.orderId) {
      const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Order not found');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        orderId: dto.orderId,
        text: dto.text,
        attachments: dto.attachments || [],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    return message;
  }

  async getConversation(userId: string, otherUserId: string, orderId?: string, page = 1, limit = 50) {
    const where: any = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    if (orderId) where.orderId = orderId;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({ where }),
    ]);

    return {
      items: messages.reverse(),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getConversations(userId: string) {
    const sentMessages = await this.prisma.chatMessage.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.chatMessage.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const userIds = new Set<string>();
    sentMessages.forEach((m) => userIds.add(m.receiverId));
    receivedMessages.forEach((m) => userIds.add(m.senderId));

    const conversations = [];

    for (const otherUserId of userIds) {
      const [lastMessage, unreadCount] = await Promise.all([
        this.prisma.chatMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        }),
        this.prisma.chatMessage.count({
          where: { senderId: otherUserId, receiverId: userId, read: false },
        }),
      ]);

      const otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId },
        select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
      });

      conversations.push({
        user: otherUser,
        lastMessage,
        unreadCount,
      });
    }

    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });

    return conversations;
  }

  async markAsRead(userId: string, senderId: string) {
    await this.prisma.chatMessage.updateMany({
      where: { senderId, receiverId: userId, read: false },
      data: { read: true },
    });

    return { message: 'Messages marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.chatMessage.count({
      where: { receiverId: userId, read: false },
    });

    return { unreadCount: count };
  }
}
