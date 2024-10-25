import { Body, Controller, Get, Param, UseInterceptors, UseGuards, UploadedFile, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from 'src/config/upload.config';
import { UpdateUserDto } from './updateuser.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserProfile(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { ...multerConfig, ...multerOptions }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user profile data',
    type: UpdateUserDto,
  })
  @ApiOperation({ summary: 'Update user profile with image upload' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const data: any = { ...updateUserDto };
    if (image) {
      data.image = '/src/uploads/profile-images/${image.filename}';
    }
    return this.userService.updateUserProfile(id, data);
  }

}
