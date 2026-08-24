import { Controller, Get, Put, Delete, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get user addresses' })
  async getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add new address' })
  async addAddress(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(userId, dto);
  }

  @Put('addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.usersService.updateAddress(userId, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.deleteAddress(userId, id);
  }
}
