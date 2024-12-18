import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './dto/updatetransaction.dto';
import { AccountService } from "../account/account.service";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";

@Injectable()
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accountService: AccountService,
    ) {}

    async createTransaction(userId: string, data: CreateTransactionDto, attachmentImageFile?: Express.Multer.File){
        const { accountId, type, amount, categoryTag, remark, description, attachmentImage } = data;
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
        });

        if(!account) 
            throw new NotFoundException(`Account with ID ${accountId} not found for user with ID ${userId}.`);

        if (type === TransactionType.EXPENSE && account.balance < amount) {
            throw new BadRequestException('Insufficient balance for this transaction.');
        }

        const attachmentImagePath = attachmentImageFile
            ? `/uploads/transaction-images/${attachmentImageFile.filename}`
            : null;

        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                accountId,
                categoryTag,
                remark,
                amount,
                description,
                attachmentImage: attachmentImagePath,
                type,
            },
        });

        const updatedBalance = type === TransactionType.INCOME
        ? account.balance + amount
        : account.balance - amount;

        await this.prisma.account.update({
         where: { id: accountId },
            data: { balance: updatedBalance },
        });

            return transaction;
        }

    async transferTransaction(userId: string, data: TransferTransactionDto) {
        const { fromAccountId, toAccountId, amount, remark } = data;

        const sourceAccount = await this.prisma.account.findFirst({
            where: { id: fromAccountId, userId },
        });

        if (!sourceAccount) {
            throw new NotFoundException(`Source account with ID ${fromAccountId} not found for user ID: ${userId}`);
        }

        if(sourceAccount.balance < amount) {
            throw new BadRequestException('Insufficient balance for this transaction.');
        }

        const destinationAccount = await this.prisma.account.findFirst({
            where: { id: toAccountId },
        });

        if(!destinationAccount) {
            throw new NotFoundException(`Destination account with ID ${toAccountId} not found.`);
        }

        await this.prisma.transaction.create({
            data: {
                userId,
                accountId: fromAccountId,
                categoryTag: 'Transfer Out',
                remark,
                amount,
                type: TransactionType.EXPENSE,
            },
        });

        const updatedScourceBalance = sourceAccount.balance - amount;
        await this.prisma.account.update({
            where: { id: fromAccountId },
            data: { balance: updatedScourceBalance },
        });

        await this.prisma.transaction.create({
            data: {
                userId,
                accountId: toAccountId,
                categoryTag: 'Transfer In',
                remark,
                amount,
                type: TransactionType.INCOME,
            },
        });

        const updatedDestinationBalance = destinationAccount.balance + amount;
        await this.prisma.account.update({
            where: { id: toAccountId },
            data: { balance: updatedDestinationBalance },
        });

        return { message: 'Transfer successful', amount, fromAccountId, toAccountId };
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