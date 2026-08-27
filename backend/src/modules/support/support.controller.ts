import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateSupportTicketDto, ReplyToTicketDto, UpdateTicketStatusDto } from './dto/create-support-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateSupportTicketDto) {
    return this.supportService.createTicket(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my tickets' })
  getMyTickets(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supportService.getMyTickets(userId, page, limit);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get support stats (Admin)' })
  getStats() {
    return this.supportService.getStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all tickets (Admin)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    return this.supportService.findAllAdmin(page, limit, status, priority);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket detail' })
  async getTicket(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    const isAdmin = role === 'ADMIN';
    return this.supportService.getTicket(id, userId, isAdmin);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to ticket' })
  async reply(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
    @Body() dto: ReplyToTicketDto,
  ) {
    const isStaff = role === 'ADMIN';
    return this.supportService.reply(id, userId, dto, isStaff);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update ticket status (User or Admin)' })
  updateStatus(@CurrentUser('id') _userId: string, @Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.supportService.updateStatus(id, dto);
  }
}
