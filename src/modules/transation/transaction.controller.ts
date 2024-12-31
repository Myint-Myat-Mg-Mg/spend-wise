import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./dto/transaction.dto";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";
import { UpdateTransactionDto } from "./dto/updatetransaction.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtStrategy } from "../auth/jwt.strategy";
import { Request, Param } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

    @Get()
    @ApiOperation({ summary: 'Retrieve all transactions' })
    @ApiResponse({ status: 200, description: 'All transactions retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No transactions found' })
    @UseGuards(AuthGuard('jwt'))
    async getAllTransactions(@Request() req: any) {
        const userId = req.user.id;
        return this.transactionService.getAllTransactions(userId);
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

    