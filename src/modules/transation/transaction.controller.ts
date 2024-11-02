import { Controller, Get, Post, Body, Param, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./transaction.dto";
import { UpdateTransactionDto } from "./updatetransaction.dto";

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

    @Post()
    @ApiOperation({ summary: 'Create a new transaction' })
    async create(@Body() dto: CreateTransactionDto) {
        return this.transactionService.create(dto);
    }

    @Get(':userId')
    @ApiOperation({ summary: 'Get all transactions for a user' })
    async findAll(@Param('userId') userId: string) {
        return this.transactionService.findAll(userId);
    }

    @Get("single/:id")
    @ApiOperation({ summary: 'Get a single transaction by ID' })
    async findOne(@Param('id') id: string) {
        return this.transactionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a existing transaction' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateTransactionDto
    ) {
        return this.transactionService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a transaction' })
    async remove(@Param('id') id: string) {
        return this.transactionService.remove(id);
    }
}