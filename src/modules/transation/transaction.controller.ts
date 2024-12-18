import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./dto/transaction.dto";
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
}

    