import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Ko Zin' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'kozin@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiProperty({ example: 'kozin123' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({type: 'string', format:'binary'})
  @IsOptional()
  image?: File;
}
