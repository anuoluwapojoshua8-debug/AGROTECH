import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}
