import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: "Ko Zin" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "kozin@gmail.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "kozin321" })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({type: 'string', format:'binary'})
  @IsOptional()
  image?: File; // Optional field
}
