import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create_category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all categories
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: {
        updatedAt: 'desc', // Sort by the `updatedAt` field in descending order
      },
    });
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

      try {
        return await this.prisma.category.create({
          data: {
            name,
            icon: icon || null, // Default to null if no icon is provided
            private: privateValue, // Ensure this is a boolean
          },
        });
      } catch (error) {
        if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
          throw new ConflictException('Category name must be unique.');
        }
        throw error;
      }
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
