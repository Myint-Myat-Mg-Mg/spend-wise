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
    const { name, icon, private: isPrivate } = data;

    const privateValue = typeof isPrivate === 'string' ? isPrivate === 'true' : isPrivate;
      
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

    const uncategorized = await this.prisma.category.findFirst({ where: { name: 'Uncategorized', private: false } });
    const fallbackCategoryId = uncategorized ? uncategorized.id : null;

    await this.prisma.transaction.updateMany({
      where: { categoryId },
      data: { categoryId: fallbackCategoryId }, // Or handle these transactions differently
    });

    return this.prisma.category.delete({ where: { id: categoryId } });
  }
}
