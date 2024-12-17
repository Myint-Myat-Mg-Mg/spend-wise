import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './dto/updatetransaction.dto';
import { AccountService } from "../account/account.service";

@Injectable()
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accountService: AccountService,
    ) {}

    async createTransaction(userId: string, data: CreateTransactionDto){
        const { accountId, type, amount, categoryTag, remark, description, attachmentImage } = data;
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
        });

        if(!account) 
            throw new NotFoundException(`Account with ID ${accountId} not found for user with ID ${userId}.`);

        if (type === 'EXPENSE' && account.balance < amount) {
            throw new BadRequestException('Insufficient balance for this transaction.');
        }

        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                accountId,
                categoryTag,
                remark,
                amount,
                description,
                attachmentImage,
                type,
            },
        });

        if (type === 'INCOME') {
            await this.prisma.account.update({
                where: { id: accountId },
                data: { balance: account.balance + amount },
            });
        } else if (type === 'EXPENSE') {
            await this.prisma.account.update({
                where: { id: accountId },
                data: { balance: account.balance - amount },
            });
        }

        return transaction;
    }
}
    // async findAll(userId: string): Promise<Transaction[]> {
    //     return this.prisma.transaction.findMany({
    //         where: { userId },
    //         include: {
    //             account: true,
    //         },
    //     });
    // }

    // async addTransaction(body: any, file: Express.Multer.File, type: TransactionType) {
    //     const { userId, accountId, amount, categoryTag, remark, description } = body;
    

    //     const parsedAmount = Number(amount);
    // if (isNaN(parsedAmount)) {
    //     throw new BadRequestException('Invalid amount provided. It must be a number.');
    // }
    //     // Validate account
    //     const account = await this.prisma.account.findFirst({
    //       where: { id: accountId, userId },
    //     });
    
    //     if (!account) {
    //       throw new NotFoundException(`Account not found for user ID: ${userId}`);
    //     }
    
    //     // Validate expense balance
    //     if (type === 'EXPENSE' && account.balance < parsedAmount) {
    //       throw new BadRequestException('Insufficient balance for this transaction.');
    //     }
    
    //     // Adjust balance
    //     const newBalance = type === 'INCOME' 
    //       ? account.balance + parsedAmount 
    //       : account.balance - parsedAmount;
    
    //    // Update account balance
    //     await this.prisma.account.update({
    //       where: { id: accountId },
    //       data: { balance: newBalance },
    //     });
    
    //     // Save transact ion
    //     const transaction = await this.prisma.transaction.create({
    //       data: {
    //         userId,
    //         accountId,
    //         type,
    //         amount: parsedAmount,
    //         categoryTag,
    //         remark,
    //         description,
    //         attachmentImage: file?.path, // Save file path
    //       },
    //     });

    //     return transaction;
      
    //  }
//}