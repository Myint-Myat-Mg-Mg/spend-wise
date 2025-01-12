import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
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

  async updateUserProfile(id: string, data: UpdateUserDto, image?: Express.Multer.File): Promise<User> {

    const updatedData: Prisma.UserUpdateInput = { ...data };

  // Process the image if provided
  if (image) {
    const imagePath = `uploads/profile-images/${image.filename}`;
    updatedData.image = imagePath;
  }

  // Check if password is being updated
  if (updatedData.password && typeof updatedData.password === 'string') {
    const hashedPassword = await bcrypt.hash(updatedData.password, 10);
    updatedData.password = hashedPassword;
  }

  // Update the user in the database
  return this.prisma.user.update({
    where: { id },
    data: updatedData,
  });
  }


  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({ 
      where: { id } 
    });
  }

  async getUserProfile(userId: string) {
    const userProfile = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        account: {
          select: {
            balance: true,
            transaction: {
              select: {
                type: true, // Income or Expense
                amount: true,
              },
            },
          },
        },
      },
    });

    if (!userProfile) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let totalBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const account of userProfile.account) {
      totalBalance += account.balance;

      for (const transaction of account.transaction) {
        if (transaction.type === 'INCOME') {
          totalIncome += transaction.amount;
        } else if (transaction.type === 'EXPENSE') {
          totalExpenses += transaction.amount;
        }
      }
    }

    return {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      image: userProfile.image,
      totalBalance,
      totalIncome,
      totalExpenses,
    }
  }
  
}
