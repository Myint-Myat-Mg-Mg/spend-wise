import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create_category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all categories
  async getCategories() {
    return this.prisma.category.findMany();
  }

  // Create a new category
  async createCategory(data: CreateCategoryDto) {
    const { name, icon } = data;

    const predefinedCategories = [
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

      const privateValue = !predefinedCategories.includes(name);

    return this.prisma.category.create({
      data: {
        name,
        icon: icon || null, // Default to null if no icon is provided
        private: privateValue, // Ensure this is a boolean
      },
    });
  }
  
  // Delete a category
  async deleteCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    await this.prisma.transaction.updateMany({
      where: { categoryId },
      data: { categoryId: null }, // Unlink the transactions from the deleted category
    });

    return this.prisma.category.delete({ where: { id: categoryId } });
  }
}
