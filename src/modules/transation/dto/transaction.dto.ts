import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AccountType, AccountSubType, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Account ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Category tag for transaction', example: 'food' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Remark', example: 'Dinner with family' })
  @IsString()
  @IsNotEmpty()
  remark: string;

  @ApiProperty({ description: 'Transaction amount', example: 5000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Description (optional)', example: 'Spent on dinner', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Attachment image (optional)', type: 'string', format: 'binary', required: false})
  @IsOptional()
  @IsString()
  attachmentImage?: string;

  @ApiProperty({ description: 'Transaction type, either INCOME or EXPENSE', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}

