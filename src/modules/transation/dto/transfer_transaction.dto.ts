import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class TransferTransactionDto {
  @ApiProperty({ description: 'Source account ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  fromAccountId: string;

  @ApiProperty({ description: 'Destination account ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  toAccountId: string;

  @ApiProperty({ description: 'Transfer amount', example: 5000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Remark for the transaction', example: 'Transfer to savings' })
  @IsString()
  @IsNotEmpty()
  remark: string;

  @ApiProperty({ description: 'Description for the transaction', example: 'Transfer to savings after to buy something need' })
  @IsString()
  @IsNotEmpty()
  description?: string;
}
