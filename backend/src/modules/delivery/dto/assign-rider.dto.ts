import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRiderDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  riderId: string;
}
