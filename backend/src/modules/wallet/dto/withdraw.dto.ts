import { IsNumber, IsOptional, IsString, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankDetailsDto {
  @ApiProperty()
  @IsString()
  bank: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  accountName: string;
}

export class WithdrawDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  bankDetails?: BankDetailsDto;
}
