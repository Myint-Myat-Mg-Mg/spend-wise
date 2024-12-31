import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './dto/updatetransaction.dto';
import { AccountService } from "../account/account.service";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accountService: AccountService,
    ) {}

    async getAllTransactions(userId: string) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            include: {
                account: true, // Includes account details
                category: true, // Includes category details
            },
            orderBy: { createdAt: 'desc' }, // Sort by most recent
        });
    
        return transactions;
    }

    async getTransactionById(userId: string, transactionId: string) {
        const transaction = await this.prisma.transaction.findFirst({
            include: {
                account: true,
                category: true,
            },
        });

        if(!transaction) {
            throw new NotFoundException(`Transaction with ID ${transactionId} not found for user ID: ${userId}`)
        }

        return transaction;
    }

    async createTransaction(userId: string, data: CreateTransactionDto, attachmentImageFile?: Express.Multer.File){
        const { accountId, type, amount, categoryId, remark, description } = data;

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new BadRequestException('Invalid amount: must be a positive number.');
        }

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

        const attachmentImagePath = attachmentImageFile?.filename
            ? `/uploads/transaction-images/${attachmentImageFile.filename}`
            : null;

        const updatedBalance = type === TransactionType.INCOME
        ? account.balance + parsedAmount
        : account.balance - parsedAmount;

        const [transaction] = await this.prisma.$transaction([
            this.prisma.transaction.create({
                data: {
                    userId,
                    accountId,
                    categoryId,
                    remark,
                    amount: parsedAmount,
                    description,
                    attachmentImage: attachmentImagePath,
                    type,
                },
            }),
            this.prisma.account.update({
                where: { id: accountId },
                data: { balance: updatedBalance },
            }),
        ]);
    
        return transaction;
    }

    async transferTransaction(userId: string, data: TransferTransactionDto, attachmentImageFile?: Express.Multer.File) {
        const { fromAccountId, toAccountId, amount, remark, description } = data;

        const transferAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;

        if (isNaN(transferAmount) || transferAmount <= 0) {
            throw new BadRequestException('Invalid transfer amount.');
        }

        const sourceAccount = await this.prisma.account.findFirst({
            where: { id: fromAccountId, userId },
        });

        if (!sourceAccount) {
            throw new NotFoundException(`Source account with ID ${fromAccountId} not found for user ID: ${userId}`);
        }

        if(sourceAccount.balance < transferAmount) {
            throw new BadRequestException('Insufficient balance for this transaction.');
        }

        const destinationAccount = await this.prisma.account.findFirst({
            where: { id: toAccountId },
        });
        if(!destinationAccount) {
            throw new NotFoundException(`Destination account with ID ${toAccountId} not found.`);
        }

        // Generate a unique transfer group ID
        const transferGroupId = uuidv4();
        
          // Handle optional attachment image
        const attachmentImagePath = attachmentImageFile
            ? `/uploads/transaction-images/${attachmentImageFile.filename}`
            : null;

        const transferOutTransaction = await this.prisma.transaction.create({
            data: {
              userId,
              accountId: fromAccountId,
              remark: `Transfer Out: ${remark}`,
              amount: transferAmount,
              description,
              attachmentImage: attachmentImagePath,
              type: TransactionType.TRANSFER,
              transferGroupId,
             },
           });
            
              // Update source account balance
        const updatedSourceBalance = sourceAccount.balance - transferAmount;
        await this.prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: updatedSourceBalance },
        });
            
              // Create transaction for destination account (Transfer In)
        const transferInTransaction = await this.prisma.transaction.create({
        data: {
            userId,
            accountId: toAccountId,
            remark: `Transfer In: ${remark}`,
            amount: transferAmount,
            description,
            attachmentImage: attachmentImagePath,
            type: TransactionType.TRANSFER,
            transferGroupId,
        },
        });
            
              // Update destination account balance
        const updatedDestinationBalance = destinationAccount.balance + transferAmount;
        await this.prisma.account.update({
           where: { id: toAccountId },
          data: { balance: updatedDestinationBalance },
        });
    
      return {
        message: 'Transfer successful',
        amount: transferAmount,
        transferGroupId,
        fromAccountId,
        toAccountId,
        attachmentFile: attachmentImagePath,
        transferOutTransaction,
        transferInTransaction,
      };
    }

    async getTransferTransaction(userId: string, transferGroupId: string) {
        const transactions = await this.prisma.transaction.findMany({
          where: {
            userId,
            transferGroupId,
          },
          include: {
            account: true, // Include account details for context
          },
        });
      
        if (transactions.length === 0) {
          throw new NotFoundException(`No transactions found for transfer group ID: ${transferGroupId}`);
        }
      
        const transferOutTransaction = transactions.find(tx => tx.remark.startsWith('Transfer Out'));
        const transferInTransaction = transactions.find(tx => tx.remark.startsWith('Transfer In'));
      
        return {
          message: 'Transfer transaction details retrieved successfully.',
          transferGroupId,
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