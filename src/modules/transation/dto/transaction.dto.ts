import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AccountType, AccountSubType, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Account ID associated with the transaction' })
  @IsUUID()
  accountId: string;

  @ApiProperty({ description: 'Category tag for transaction', example: 'food' })
  @IsString()
  @IsNotEmpty()
  categoryTag: string;

  @ApiProperty({ description: 'Remark for transaction', example: 'Monthly food' })
  @IsString()
  @IsNotEmpty()
  remark: string;

  @ApiProperty({ description: 'Transaction amount in Kyats' })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Description of Transaction', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'image'})
  @IsOptional()
  @IsString()
  attachmentImage?: string;

  @ApiProperty({ description: 'Transaction type, either INCOME or EXPENSE', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;
}

