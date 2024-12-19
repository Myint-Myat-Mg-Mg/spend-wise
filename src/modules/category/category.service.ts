import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create_category.dto';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const defaultCategories = [
      { name: 'Shopping', private: false },
      { name: 'Subscription', private: false },
      { name: 'Food', private: false },
      { name: 'Salary', private: false },
      { name: 'Transportation', private: false },
      { name: 'General Use', private: false },
      { name: 'Loan', private: false },
      { name: 'Borrow', private: false },
    ];

    await this.prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true, // Avoid recreating existing categories
    });

    console.log('Default categories initialized.');
  }

  // Get all categories
  async getCategories() {
    return this.prisma.category.findMany();
  }

  // Create a new category
  async createCategory(data: CreateCategoryDto) {
    const { name, icon } = data;
  
    // Predefined category tags
    const categoryTags = [
      'Shopping',
      'Subscription',
      'Food',
      'Salary',
      'Transportation',
      'General Use',
      'Loan',
      'Borrow',
    ];
  
    // Dynamically set the `private` value as a boolean
    const isPrivate = name === 'Other' ? true : !categoryTags.includes(name);
  
    const existingCategory = await this.prisma.category.findUnique({
        where: { name },
      });
    
      if (existingCategory) {
        throw new Error(`Category with name '${name}' already exists.`);
      }
      
    return this.prisma.category.create({
      data: {
        name,
        icon: icon || null, // Default to null if no icon is provided
        private: isPrivate, // Ensure this is a boolean
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
