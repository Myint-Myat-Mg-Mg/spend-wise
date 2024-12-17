import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  // Create a new user
  async create(data: CreateUserDto ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { password: newPassword },
    });
  }

  async updateUserProfile(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ 
      where: { id } 
    });
  }

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        account: {
          select: {
            id: true,
            name: true,
            balance: true,
            accountType: true,
            accountSubType: true,
            transaction: {
              select: {
                id: true,
                type: true, // Income or Expense
                amount: true,
                description: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }
  
}
