import { Body, Controller, Get, Param, UseInterceptors, UseGuards, UploadedFile, Post, Put, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from 'src/config/upload.config';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from '@nestjs/common';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(':id')
  // @ApiOperation({ summary: 'Get user profile' })
  // @ApiResponse({ status: 200, description: 'User profile fetched successfully.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // async getUserProfile(@Param('id') id: string) {
  //   return this.userService.findById(id);
  // }

  @Get('profile')
  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user profile.', })
  @ApiResponse({ status: 401, description: 'Unauthorized. Token is missing or invalid.', })
  @UseGuards(AuthGuard('jwt')) // Ensure AuthGuard is imported
  async getUserProfile(@Request() req) {
    const userId = req.user.id; // Extract user ID from the authenticated token
    const userProfile = await this.userService.getUserProfile(userId);
    return { profile: userProfile };
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { ...multerConfig, ...multerOptions }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Update user profile data', type: UpdateUserDto, })
  @ApiOperation({ summary: 'Update user profile with image upload' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.userService.updateUserProfile(id, updateUserDto, image);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a new user' })
  // @ApiResponse({ status: 201, description: 'User created successfully.' })
  // create(@Body() CreateUserDto) {
  //   return this.userService.create(CreateUserDto);
  // }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }

}
