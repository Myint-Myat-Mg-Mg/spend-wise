import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './dto/updatetransaction.dto';

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateTransactionDto): Promise<Transaction> {
        const { userId, accountId, amount, type } = dto;
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
        });

        if(!account) throw new NotFoundException('Account not found');

        const updateBalance = type === TransactionType.INCOME
         ? account.balance + amount
         : account.balance - amount;
        
        await this.prisma.account.update({
            where: { id: accountId },
            data: { balance: updateBalance },
        });

        return this.prisma.transaction.create({
            data: {
                ...dto,
                userId,
                accountId,
            },  
        });
    }

    async findAll(userId: string): Promise<Transaction[]> {
        return this.prisma.transaction.findMany({
            where: { userId },
            include: {
                account: true,
            },
        });
    }
   
    async findOne(id: string): Promise<Transaction> {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { account: true },
        });
        if (!transaction) throw new NotFoundException('Transaction not found');
        return transaction;
    }

    async update(id: string, dto: UpdateTransactionDto): Promise<Transaction> {
        return this.prisma.transaction.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string): Promise<Transaction> {
        return this.prisma.transaction.delete({
            where: { id },
        });
    }

    async addTransaction(body: any, file: Express.Multer.File, type: string) {
        const { userId, accountId, amount, categoryTag, remark, description } = body;
    
        // Validate account
        const account = await this.prisma.account.findFirst({
          where: { id: accountId, userId },
        });
    
        if (!account) {
          throw new NotFoundException(`Account not found for user ID: ${userId}`);
        }
    
        // Validate expense balance
        if (type === 'EXPENSE' && account.balance < amount) {
          throw new BadRequestException('Insufficient balance for this transaction.');
        }
    
        // Adjust balance
        const newBalance = type === 'INCOME' 
          ? account.balance + amount 
          : account.balance - amount;
    
        // Update account balance
        await this.prisma.account.update({
          where: { id: accountId },
          data: { balance: newBalance },
        });
    
        // Save transaction
        const transaction = await this.prisma.transaction.create({
          data: {
            userId,
            accountId,
            type,
            amount,
            categoryTag,
            remark,
            description,
            attachmentImage: file?.path, // Save file path
          },
        });
    
        return transaction;
      }
}