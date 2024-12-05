import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./dto/transaction.dto";
import { UpdateTransactionDto } from "./dto/updatetransaction.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtStrategy } from "../auth/jwt.strategy";

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

    @Post('income')
    @ApiOperation({ summary: 'Add income transaction' })
    @UseInterceptors(FileInterceptor('attachmentImage')) // For image upload
    async addIncome(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.transactionService.addTransaction(body, file, 'INCOME');
    }

    @Post('expense')
    @ApiOperation({ summary: 'Add expense transaction' })
    @UseInterceptors(FileInterceptor('attachmentImage')) // For image upload
    async addExpense(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
    return this.transactionService.addTransaction(body, file, 'EXPENSE');
    }
}