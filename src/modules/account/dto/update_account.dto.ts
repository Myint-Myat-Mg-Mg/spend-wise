import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAccountNameDto {
  @ApiProperty({ description: 'New account name', example: 'New Lifestyle Budget' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
