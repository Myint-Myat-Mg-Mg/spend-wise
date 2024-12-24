import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./dto/transaction.dto";
import { TransferTransactionDto } from "./dto/transfer_transaction.dto";
import { UpdateTransactionDto } from "./dto/updatetransaction.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtStrategy } from "../auth/jwt.strategy";
import { Request } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

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

    