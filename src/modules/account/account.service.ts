import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Account, AccountType, AccountSubType } from '@prisma/client';
import { CreateAccountDto } from './dto/create_account.dto';

@Injectable()
export class AccountService {
    constructor(private readonly prisma: PrismaService) {}

    async createAccount(userId: string, data: CreateAccountDto) {
        // Validate the account type and subtype combination
        const validSubtypes = this.getValidSubtypes(data.accountType);
    
        if (!validSubtypes.includes(data.accountSubType)) {
          throw new BadRequestException(
            `Invalid account subtype '${data.accountSubType}' for account type '${data.accountType}'.`,
          );
        }
    
        // Create the account
        return this.prisma.account.create({
          data: {
            name: data.name,
            balance: data.balance,
            accountType: data.accountType,
            accountSubType: data.accountSubType,
            userId,
          },
        });
      }
    
      private getValidSubtypes(accountType: AccountType): AccountSubType[] {
        switch (accountType) {
          case AccountType.WALLET:
            return [AccountSubType.WALLET];
          case AccountType.BANK:
            return [
              AccountSubType.KBZBANK,
              AccountSubType.CBBANK,
              AccountSubType.AYABANK,
              AccountSubType.YOMABANK,
              AccountSubType.AGDBANK,
              AccountSubType.OTHER_BANK,
            ];
          case AccountType.PAY:
            return [
              AccountSubType.KBZPAY,
              AccountSubType.CBPAY,
              AccountSubType.AYAPAY,
              AccountSubType.WAVEPAY,
              AccountSubType.OKDOLLAR,
              AccountSubType.OTHER_PAY,
            ];
          default:
            return [];
        }
      }

      async getUserAccounts(userId: string) {
        const accounts = await this.prisma.account.findMany({
          where: { userId },
        });
    
        if (!accounts.length) {
          throw new NotFoundException(`No accounts found for user with ID ${userId}.`);
        }
    
        return accounts;
      }
    
      // Get a specific account for a user
      async getUserAccount(userId: string, accountId: string) {
        const account = await this.prisma.account.findFirst({
          where: { id: accountId, userId },
        });
    
        if (!account) {
          throw new NotFoundException(
            `Account with ID ${accountId} not found for user with ID ${userId}.`,
          );
        }
    
        return account;
      }
}