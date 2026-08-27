import { IsString, IsOptional, IsEnum, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiPropertyOptional as ApiOptional } from '@nestjs/swagger';

export enum SupportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateSupportTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({ enum: SupportPriority, default: SupportPriority.MEDIUM })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;
}

export class ReplyToTicketDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @IsString()
  status: string;
}
