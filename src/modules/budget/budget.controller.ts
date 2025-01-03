import { Controller, Post, Get, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateBudgetDto } from './dto/butget-create.dto';

@ApiTags('Budget')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(AuthGuard('jwt'))
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  async createBudget(
    @Request() req: any,
    @Body() createBudgetDto: CreateBudgetDto 
  ) {
    const userId = req.user.id;
    return this.budgetService.createBudget(
      userId,
      createBudgetDto.amount,
      createBudgetDto.categoryId,
      createBudgetDto.notification,
      createBudgetDto.percentage
    );
  }

  @Get(':budgetId')
  @ApiOperation({ summary: 'Track a budget' })
  @ApiResponse({ status: 200, description: 'Budget tracked successfully' })
  async trackBudget(@Request() req: any, @Param('budgetId') budgetId: string) {
    const userId = req.user.id;
    return this.budgetService.trackBudget(userId, budgetId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all budgets' })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully' })
  async getAllBudgets(@Request() req: any) {
    const userId = req.user.id;
    return this.budgetService.getAllBudgets(userId);
  }

  @Patch(':budgetId')
  @ApiOperation({ summary: 'Edit a budget' })
  @ApiResponse({ status: 200, description: 'Budget updated successfully' })
  async editBudget(
    @Param('budgetId') budgetId: string,
    @Body() updateBudgetDto: { notification?: boolean; percentage?: number }
  ) {
    return this.budgetService.editBudget(budgetId, updateBudgetDto);
  }

  @Delete(':budgetId')
  @ApiOperation({ summary: 'Delete a budget' })
  @ApiResponse({ status: 200, description: 'Budget deleted successfully' })
  async deleteBudget(@Param('budgetId') budgetId: string) {
    return this.budgetService.deleteBudget(budgetId);
  }
}
