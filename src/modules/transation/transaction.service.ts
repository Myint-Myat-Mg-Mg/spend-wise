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
        const { accountId, type, amount, categoryId, remark, description } = data;
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
        });

        if(!account) 
            throw new NotFoundException(`Account with ID ${accountId} not found for user with ID ${userId}.`);

        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${categoryId} not found.`);
        }

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
                categoryId,
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

    async transferTransaction(userId: string, data: TransferTransactionDto, attachmentImageFile?: Express.Multer.File) {
        const { fromAccountId, toAccountId, amount, remark, description } = data;

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

        const transferCategory = await this.prisma.category.findFirst({
            where: { name: 'Transfer', private: false },
        });
        if (!transferCategory) {
            throw new NotFoundException(`Category "Transfer" not found.`);
        }
        
          // Handle optional attachment image
        const attachmentImagePath = attachmentImageFile
            ? `/uploads/transaction-images/${attachmentImageFile.filename}`
            : null;

        const transferOutTransaction = await this.prisma.transaction.create({
            data: {
              userId,
              accountId: fromAccountId,
              categoryId: transferCategory.id,
               remark: `Transfer Out: ${remark}`,
               amount,
               description,
               attachmentImage: attachmentImagePath,
               type: TransactionType.EXPENSE,
             },
           });
            
              // Update source account balance
        const updatedSourceBalance = sourceAccount.balance - amount;
        await this.prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: updatedSourceBalance },
        });
            
              // Create transaction for destination account (Transfer In)
        const transferInTransaction = await this.prisma.transaction.create({
        data: {
            userId,
            accountId: toAccountId,
            categoryId: transferCategory.id,
            remark: `Transfer In: ${remark}`,
            amount,
            description,
            attachmentImage: attachmentImagePath,
            type: TransactionType.INCOME,
        },
        });
            
              // Update destination account balance
        const updatedDestinationBalance = destinationAccount.balance + amount;
        await this.prisma.account.update({
           where: { id: toAccountId },
          data: { balance: updatedDestinationBalance },
        });
    
      return {
        message: 'Transfer successful',
        amount,
        fromAccountId,
        toAccountId,
        transferOutTransaction,
        transferInTransaction,
      };
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