import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./dto/transaction.dto";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";
import { UpdateTransactionDto } from "./dto/updatetransaction.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtStrategy } from "../auth/jwt.strategy";
import { Request, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

enum TransactionFilterType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    TRANSFER = 'TRANSFER',
  }
  
  enum TransactionSortType {
    HIGHEST = 'HIGHEST',
    LOWEST = 'LOWEST',
    NEWEST = 'NEWEST',
    OLDEST = 'OLDEST',
  }

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

    @Get()
    @ApiOperation({ summary: 'Retrieve all transactions' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions per page (default: 10)' })
    @ApiQuery({
        name: 'filterBy',
        required: false,
        description: 'Filter transactions by type',
        enum: TransactionFilterType, // Dropdown for filterBy
      })
      @ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Sort transactions by criteria',
        enum: TransactionSortType, // Dropdown for sortBy
      })
    @ApiResponse({ status: 200, description: 'All transactions retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No transactions found' })
    @UseGuards(AuthGuard('jwt'))
    async getAllTransactions(
        @Request() req: any, 
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 10,
        @Query('filterBy') filterBy?: TransactionFilterType,
        @Query('sortBy') sortBy?: TransactionSortType,
    ){
        const userId = req.user.id;

        // Validate pagination parameters
        const validatedPage = Math.max(1, page); // Ensure page is at least 1
        const validatedLimit = Math.min(100, Math.max(1, limit)); // Ensure limit is between 1 and 100

        return this.transactionService.getAllTransactions(userId, validatedPage, validatedLimit, filterBy, sortBy);
    }

    @Get(':transactionId')
    @ApiOperation({ summary: 'Retrieve a transaction by ID' })
    @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Transaction not found' })
    @UseGuards(AuthGuard('jwt'))
    async getTraansactionById(@Request() req: any, @Param('transactionId') transactionId: string) {
        const userId = req.user.Id;
        return this.transactionService.getTransactionById(userId, transactionId);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new transaction (Income/Expense)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: 'Transaction details with optional image', type: CreateTransactionDto })
    @ApiResponse({ status: 201, description: 'Transaction added sucessfully' })
    @ApiResponse({ status: 409, description: 'Transaction failed.' })
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('attachmentImage', { dest: './uploads/transaction-images' }))
    async createTransaction(
        @Request() req,
        @Body() createTransactionDto: CreateTransactionDto,
        @UploadedFile() attachmentImage?: Express.Multer.File,
    ) {
        const userId = req.user.id;

        const transactionData = {
            ...createTransactionDto,
            attachmentImage: attachmentImage ? `/uploads/transaction-images/${attachmentImage.filename}` : undefined,
        };

        return this.transactionService.createTransaction(userId, createTransactionDto);
    }

    @Get('transfer/:transferGroupId')
    @ApiOperation({ summary: 'Retrieve transfer transaction details by group ID' })
    @ApiResponse({ status: 200, description: 'Transfer transaction details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Transfer transaction not found' })
    @UseGuards(AuthGuard('jwt'))
    async getTransferTransaction(
        @Request() req: any,
        @Param('transferGroupId') transferGroupId: string
    ) {
        const userId = req.user.id; // Extract the user ID from the request
        return this.transactionService.getTransferTransaction(userId, transferGroupId);
    }
 
    @Post('transfer')
    @ApiOperation({ summary: 'Transfer between accounts' })
    @ApiConsumes('multipart/form-data') // Use JSON input format
    @ApiBody({ description: 'Transfer transaction details', type: TransferTransactionDto })
    @ApiResponse({ status: 201, description: 'Transfer completed successfully' })
    @ApiResponse({ status: 409, description: 'Transfer failed.' })
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('attachmentFile', { dest: './uploads/transfer-files' }))
    async transferTransaction(@Request() req: any, @Body() data: TransferTransactionDto, @UploadedFile() attachmentFile?: Express.Multer.File, ) {
        const userId = req.user.id; // Adjust based on your authentication logic
        
        const transferData = { 
            ...data,
            attachmentFile: attachmentFile ? `/uploads/transfer-files/${attachmentFile.filename}` : undefined,
        };

        return this.transactionService.transferTransaction(userId, transferData);
    }
}

    