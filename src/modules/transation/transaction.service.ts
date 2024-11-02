import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './updatetransaction.dto';
import { dot } from "node:test/reporters";


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
}