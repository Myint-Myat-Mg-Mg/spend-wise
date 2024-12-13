import { Controller, Get, Post, Body, Param, Patch, Delete, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
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
    @ApiConsumes('multipart/form-data') // Specify that the endpoint accepts form data
    @ApiBody({
        description: 'Income transaction details with optional attachment',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '12345' },
                accountId: { type: 'string', example: '67890' },
                amount: { type: 'number', example: 1000 },
                categoryTag: { type: 'string', example: 'Salary' },
                remark: { type: 'string', example: 'October paycheck' },
                description: { type: 'string', example: 'Income from work' },
                attachmentImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Income transaction added sucessfully' })
    @ApiResponse({ status: 409, description: 'Transaction failed.' })
    @UseInterceptors(FileInterceptor('attachmentImage')) // For image upload
    async addIncome(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.transactionService.addTransaction(body, file, 'INCOME');
    }

    @Post('expense')
    @ApiOperation({ summary: 'Add expense transaction' })
    @ApiConsumes('multipart/form-data') // Specify that the endpoint accepts form data
    @ApiBody({
        description: 'Expense transaction details with optional attachment',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', example: '12345' },
                accountId: { type: 'string', example: '67890' },
                amount: { type: 'number', example: 500 },
                categoryTag: { type: 'string', example: 'Groceries' },
                remark: { type: 'string', example: 'Weekly shopping' },
                description: { type: 'string', example: 'Bought groceries for the week' },
                attachmentImage: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Expense transaction added successfully' })
    @ApiResponse({ status: 409, description: 'Transaction failed' })
    @UseInterceptors(FileInterceptor('attachmentImage')) // For image upload
    async addExpense(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
    return this.transactionService.addTransaction(body, file, 'EXPENSE');
    }
}