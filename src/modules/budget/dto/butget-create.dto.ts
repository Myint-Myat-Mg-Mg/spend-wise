import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateBudgetDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ example: 100000, description: 'Budget amount' })
    amount: number;
  
    @IsNotEmpty()
    @ApiProperty({ example: 'category-id-123', description: 'Category ID for the budget' })
    categoryId: string;
  
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ example: true, description: 'Notification status' })
    notification: boolean;
  
    @IsNumber()
    @IsOptional()
    @ApiProperty({ example: 80, description: 'Percentage threshold for notification', required: false })
    percentage?: number;
  }

export class UpdateBudgetDto {
  @ApiProperty({ example: true, description: 'Notification status', required: false })
  notification?: boolean;

  @ApiProperty({ example: 80, description: 'Percentage threshold for notification', required: false })
  percentage?: number;
}

  