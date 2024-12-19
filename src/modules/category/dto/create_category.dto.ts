import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {

  @ApiProperty({
    description: `The name of the category.`,
    example: 'Shopping',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Icon URL or file name for the category (optional)',
    type: 'string', required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Indicates whether the category is private (optional)',
  })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  private: boolean;
}
