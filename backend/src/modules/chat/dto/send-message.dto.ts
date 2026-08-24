import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  orderId?: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
