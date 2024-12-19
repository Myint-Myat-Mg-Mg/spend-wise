import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  private static categoryTags = [
    'Shopping',
    'Subscription',
    'Food',
    'Salary',
    'Transportation',
    'General Use',
    'Loan',
    'Borrow',
    'Other',
  ];

  @ApiProperty({
    description: `Category name. Must be one of the following: ${CreateCategoryDto.categoryTags.join(', ')}.`,
    example: 'Food',
    enum: CreateCategoryDto.categoryTags,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    new RegExp(`^(${CreateCategoryDto.categoryTags.join('|')})$`),
    { message: `Category name must be one of ${CreateCategoryDto.categoryTags.join(', ')}` },
  )
  name: string;

  @ApiProperty({
    description: 'Icon URL or file name for the category (optional)',
    type: 'string', format: 'binary', required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

//   @ApiProperty({
//     description: 'Indicates whether the category is private (optional)',
//     example: true,
//     required: false,
//   })
//   @IsOptional()
//   @IsBoolean()
//   private?: boolean;
}
