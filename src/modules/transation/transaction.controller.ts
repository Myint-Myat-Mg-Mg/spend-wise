import { Controller, Get, Post, Body, Param, Patch, Delete } from "@nestjs/common";
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from "./transaction.dto";
import { UpdateTransactionDto } from "./updatetransaction.dto";

@Controller('transaction')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService){}

    @Post()
    async create(@Body() dto: CreateTransactionDto) {
        return this.transactionService.create(dto);
    }

    @Get(':userId')
    async findAll(@Param('userId') userId: string) {
        return this.transactionService.findAll(userId);
    }

    @Get("single/:id")
    async findOne(@Param('id') id: string) {
        return this.transactionService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateTransactionDto
    ) {
        return this.transactionService.update(id, dto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.transactionService.remove(id);
    }
}