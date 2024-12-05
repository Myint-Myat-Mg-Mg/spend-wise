import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
