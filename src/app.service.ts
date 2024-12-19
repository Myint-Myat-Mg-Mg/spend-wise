import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService implements OnModuleInit {
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

  getHello(): string {
    return 'Hello World!';
  }
}
