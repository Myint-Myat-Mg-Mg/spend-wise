import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  providers: [CategoryService, PrismaService],
  controllers: [CategoryController],
  exports: [CategoryService]
})
export class CategoryModule {}
