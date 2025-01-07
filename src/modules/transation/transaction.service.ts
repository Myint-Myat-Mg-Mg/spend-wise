import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTransactionDto } from "./dto/transaction.dto";
import { Transaction, TransactionType } from "@prisma/client";
import { UpdateTransactionDto } from './dto/updatetransaction.dto';
import { AccountService } from "../account/account.service";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";
import { v4 as uuidv4 } from "uuid";
import * as ExcelJS from 'exceljs';

@Injectable()
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly accountService: AccountService,
    ) {}

    async getAllTransactions(userId: string, page: number, limit: number, filterBy?: 'INCOME' | 'EXPENSE' | 'TRANSFER',
        sortBy?: 'HIGHEST' | 'LOWEST' | 'NEWEST' | 'OLDEST', fromDate?: string, toDate?: string) {
        const offset = (page - 1) * limit;

        const filters: any = { userId };
        if (filterBy) {
            filters.type = filterBy;
        }

        if (fromDate && toDate) {
            filters.createdAt = {
                gte: new Date(fromDate),
                lte: new Date(toDate),
            };
        }

        // Determine sorting logic
        let orderBy: any = { createdAt: 'desc' }; // Default to newest
        if (sortBy) {
            switch (sortBy) {
                case 'HIGHEST':
                    orderBy = { amount: 'desc' };
                    break;
                case 'LOWEST':
                    orderBy = { amount: 'asc' };
                    break;
                case 'NEWEST':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'OLDEST':
                    orderBy = { createdAt: 'asc' };
                    break;
            }
        }

        const transactions = await this.prisma.transaction.findMany({
            where: filters,
            include: {
                account: true, // Includes account details
                category: true, // Includes category details
            },
            orderBy, // Sort by most recent
            skip: offset, // Skip transactions for previous pages
            take: limit,  // Limit transactions per page
        });
    
        const totalCount = await this.prisma.transaction.count({
            where: filters,
        });
    
        return {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
            transactions,
        };
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

    async expenseUsage(userId: string, timeFrame: 'weekly' | 'monthly' | 'yearly', ): Promise<{ timeFrame: string; totalExpense: number; breakdown: { date: string; total: number }[] }> {
        const currentDate = new Date();
        let startDate: Date;
        let endDate = currentDate;
        let groupBy: 'day' | 'month';
      
        // Determine the start date and grouping based on the time frame
        if (timeFrame === 'weekly') {
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 6); // Last 7 days including today
          groupBy = 'day';
        } else if (timeFrame === 'monthly') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          groupBy = 'day';
        } else if (timeFrame === 'yearly') {
          startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + 1, 0); // First day of 12 months back
          endDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1); // Ending date
          groupBy = 'month';
        } else {
          throw new Error('Invalid time frame. Choose from "weekly", "monthly", or "yearly".');
        }
      
        // Query transactions within the time frame
        const transactions = await this.prisma.transaction.findMany({
          where: {
            userId,
            type: 'EXPENSE',
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            amount: true,
            createdAt: true,
          },
        });
      
        // Initialize a map to store aggregated totals
        const dateTotals = new Map<string, number>();
      
        // Populate the map with zeros for all dates in the range
        if (timeFrame === 'weekly' || timeFrame === 'monthly') {
            let dateCursor = new Date(startDate);
            while (dateCursor <= endDate) {
              const dateKey = dateCursor.toISOString().split('T')[0]; // YYYY-MM-DD
              dateTotals.set(dateKey, 0);
              dateCursor.setDate(dateCursor.getDate() + 1);
            }
          } else if (timeFrame === 'yearly') {
            for (let i = 0; i < 12; i++) {
              const year = startDate.getFullYear();
              const month = (startDate.getMonth() + 1).toString().padStart(2, '0'); // YYYY-MM
              const dateKey = `${year}-${month}`;
              dateTotals.set(dateKey, 0);
              startDate.setMonth(startDate.getMonth() + 1);
            }
          }
        
          // Aggregate transaction amounts
          transactions.forEach((transaction) => {
            const dateKey =
              groupBy === 'day'
                ? transaction.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
                : `${transaction.createdAt.getFullYear()}-${String(transaction.createdAt.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
            if (dateTotals.has(dateKey)) {
              dateTotals.set(dateKey, dateTotals.get(dateKey)! + transaction.amount);
            }
          });
        
          // Convert the map to an array for breakdown
          const breakdown = Array.from(dateTotals.entries()).map(([date, total]) => ({
            date,
            total,
          }));
        
          // Calculate the total expense
          const totalExpense = breakdown.reduce((sum, item) => sum + item.total, 0);
        
          return {
            timeFrame,
            totalExpense,
            breakdown,
          };  
    }

    async exportMonthlyTransactionsToExcel(userId: string, month: number, year: number): Promise<Buffer> {
        const startDate = new Date(year, month - 1, 1); // Start of the month
        const endDate = new Date(year, month, 0); // End of the month (30 or 31 days)
      
        // Fetch transactions for the month
        const transactions = await this.prisma.transaction.findMany({
          where: {
            userId,
            type: 'EXPENSE',
            createdAt: { gte: startDate, lte: endDate },
          },
          select: {
            amount: true,
            createdAt: true,
            description: true, // Add this if you need descriptions in the Excel
          },
        });
      
        // Initialize a map to store aggregated totals and transactions for each day
        const dailyTransactions = new Map<string, { transactions: any[]; total: number }>();
      
        // Populate the map with zeros for all days in the month
        for (let i = 1; i <= endDate.getDate(); i++) {
          const dateKey = new Date(year, month - 1, i).toISOString().split('T')[0]; // YYYY-MM-DD
          dailyTransactions.set(dateKey, { transactions: [], total: 0 });
        }
      
        // Aggregate transaction amounts into daily totals
        transactions.forEach((transaction) => {
          const dateKey = transaction.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
          if (dailyTransactions.has(dateKey)) {
            const dayData = dailyTransactions.get(dateKey)!;
            dayData.transactions.push(transaction); // Add transaction details
            dayData.total += transaction.amount; // Add to the daily total
          }
        });
      
        // Create an Excel workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`Transactions - ${year}-${month}`);
      
        // Add Header
        sheet.addRow(['Monthly Transactions']).font = { size: 14, bold: true };
        sheet.addRow([]);
      
        // Add Daily Transactions Header
        sheet.addRow(['Daily Transactions']).font = { size: 12, bold: true };
        sheet.addRow(['Date', 'Transaction Amounts', 'Total Amount']);
      
        // Add daily transactions to the sheet
        dailyTransactions.forEach((data, date) => {
          if (data.transactions.length === 0) {
            // No transactions for the day
            sheet.addRow([date, 'No transactions', 0]);
          } else {
            // Add transactions for the day
            const transactionDetails = data.transactions.map((t) => t.amount).join(', ');
            sheet.addRow([date, transactionDetails, data.total]);
          }
        });
      
        // Format Columns
        sheet.columns = [
          { width: 15 }, // Date
          { width: 30 }, // Transaction Amounts
          { width: 15 }, // Total Amount
        ];
      
        // Generate and return Excel file as a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
      }
         
}