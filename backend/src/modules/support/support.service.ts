import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSupportTicketDto, ReplyToTicketDto, UpdateTicketStatusDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateTicketNumber(): Promise<string> {
    const count = await this.prisma.supportTicket.count();
    return `TKT-${String(count + 1).padStart(4, '0')}`;
  }

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    const ticketNumber = await this.generateTicketNumber();
    return this.prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject: dto.subject,
        category: dto.category,
        message: dto.message,
        priority: dto.priority as any,
        messages: {
          create: {
            senderId: userId,
            message: dto.message,
          },
        },
      },
      include: { messages: true },
    });
  }

  async getMyTickets(userId: string, page = 1, limit = 20) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const total = await this.prisma.supportTicket.count({ where: { userId } });
    const items = await this.prisma.supportTicket.findMany({
      where: { userId },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (p - 1) * l,
      take: l,
    });
    return {
      items,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  async getTicket(ticketId: string, userId: string, isAdmin = false) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: !isAdmin
          ? false
          : { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isAdmin && ticket.userId !== userId) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async reply(ticketId: string, senderId: string, dto: ReplyToTicketDto, isStaff = false) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        message: dto.message,
        isStaff,
      },
    });
  }

  async updateStatus(ticketId: string, dto: UpdateTicketStatusDto) {
    const status = dto.status.toUpperCase();
    const allowed = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!allowed.includes(status)) throw new BadRequestException('Invalid status');

    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as any },
    });
  }

  async findAllAdmin(page = 1, limit = 20, status?: string, priority?: string) {
    const p = Number(page) || 1;
    const l = Number(limit) || 20;
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();

    const total = await this.prisma.supportTicket.count({ where });
    const items = await this.prisma.supportTicket.findMany({
      where,
      include: {
        _count: { select: { messages: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (p - 1) * l,
      take: l,
    });
    return {
      items,
      meta: { total, page: p, limit: l, totalPages: Math.ceil(total / l) },
    };
  }

  async getStats() {
    const [open, inProgress, resolved, closed, urgentHigh] = await Promise.all([
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
      this.prisma.supportTicket.count({
        where: { priority: { in: ['URGENT', 'HIGH'] }, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
    ]);
    return { open, inProgress, resolved, closed, urgentHigh, total: open + inProgress + resolved + closed };
  }
}
