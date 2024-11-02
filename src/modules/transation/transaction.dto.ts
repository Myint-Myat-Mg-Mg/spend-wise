import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { AccountType, AccountSubType, TransactionType } from '@prisma/client';

export class CreateTransactionDto {

  @IsUUID()
  userId: string;

  @IsUUID()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  categoryTag: string;

  @IsString()
  @IsNotEmpty()
  remark: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  attachmentImage?: string;

  @IsEnum(TransactionType)
  type: TransactionType;
}

