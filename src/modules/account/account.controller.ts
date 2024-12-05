import { Controller, Get, Post, Body, Param, Delete, UnauthorizedException } from "@nestjs/common";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create_account.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtService } from '@nestjs/jwt';

@ApiTags('Account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly jwtService: JwtService,
    ) {}

    @Post(':userId')
    @ApiOperation({ summary: 'Create account for a user' })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Account created successfully.' })
    async createAccount(
        @Param('userId') userId: string,
        @Body() dto: CreateAccountDto,
      ) {
        return this.accountService.createAccount(userId, dto);
      }
    
      @Get(':userId')
      @ApiOperation({ summary: 'Get all accounts for a user' })
      @ApiResponse({ status: 200, description: 'Accounts retrieved successfully.' })
      async getUserAccounts(@Param('userId') userId: string) {
        return this.accountService.getUserAccounts(userId);
      }
    
      @Get(':userId/:accountId')
      @ApiOperation({ summary: 'Get a specific account for a user' })
      @ApiResponse({ status: 200, description: 'Account retrieved successfully.' })
      async getUserAccount(
        @Param('userId') userId: string,
        @Param('accountId') accountId: string,
      ) {
        return this.accountService.getUserAccount(userId, accountId);
      }
}