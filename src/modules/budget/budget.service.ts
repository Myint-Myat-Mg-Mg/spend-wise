import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async createBudget(userId: string, amount: number, categoryId: string, notification: boolean, percentage?: number) {
    // Create a new budget
    const budget = await this.prisma.budget.create({
      data: {
        amount,
        category: { connect: { id: categoryId } },
        notification,
        percentage,
        user: { connect: { id: userId }}
      },
    });

    return budget;
  }

  async trackBudget(userId: string, budgetId: string) {
    // Find the budget
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: { category: true },
    });

    if (!budget) {
      throw new Error('Budget not found');
    }

    // Calculate total expenses for the budget category
    const totalExpense = await this.prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    });

    const spentAmount = totalExpense._sum.amount || 0;

    // Prepare notification details
  let notification = null;
  if (budget.notification && budget.percentage) {
    const threshold = (budget.percentage / 100) * budget.amount;

    if (spentAmount >= threshold) {
      notification = {
        message: `You have spent ${spentAmount} out of your budget ${budget.amount} for category ${budget.category.name}.`,
        spentAmount,
        threshold,
      };
    }
  }

    return {
      budget,
      spentAmount,
      remainingAmount: budget.amount - spentAmount,
      notification,
    };
  }

  // private sendNotification(userId: string, categoryId: string, spentAmount: number, budgetAmount: number) {
  //   // Implement notification logic here
  //   console.log(
  //     `Notification for user ${userId}: You have spent ${spentAmount} out of your budget ${budgetAmount} for category ${categoryId}.`
  //   );
  // }

  async getAllBudgets(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Sort by most recent
    });
  }

  async editBudget(budgetId: string, data: { notification?: boolean; percentage?: number }) {
    return this.prisma.budget.update({
      where: { id: budgetId },
      data,
    });
  }

  async deleteBudget(budgetId: string) {
    return this.prisma.budget.delete({
      where: { id: budgetId },
    });
  }
}
