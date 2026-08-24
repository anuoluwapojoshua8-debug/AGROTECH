import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkDeliveredDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proofImage?: string;
}
