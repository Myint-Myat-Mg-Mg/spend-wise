import { Controller, Get, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiResponse, ApiOperation, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create_category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Get all categories
  @Get()
  @ApiOperation({ summary: 'Retrieve all categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseGuards(AuthGuard('jwt'))
  async getCategories() {
    return this.categoryService.getCategories();
  }

  // Create a new category
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Details of the category to create', type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid category name or input' })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('icon', { dest: './uploads/category-icons'}))
  async createCategory(@Body() createCategoryDto: CreateCategoryDto, @UploadedFile() iconFile?: Express.Multer.File,) {
    const iconPath = iconFile ? `/uploads/category-icons/${iconFile.filename}` : createCategoryDto.icon;
    return this.categoryService.createCategory({
      ...createCategoryDto,
      icon: iconPath,
    });
  }

  // Delete a category
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'ID of the category to delete', type: String })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
