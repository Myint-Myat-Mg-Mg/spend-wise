import { Controller, Get, Post, Body, Param, Req, UseGuards } from "@nestjs/common";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/create_account.dto";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { JwtStrategy } from "../auth/jwt.strategy";
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from "@nestjs/passport";
import { Request } from "@nestjs/common";

@ApiTags('Account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService,) {}
  
    @Post()
    @ApiOperation({ summary: 'Create account for a user' })
    @ApiResponse({ status: 201, description: 'Account created successfully.' })
    @UseGuards(AuthGuard('jwt'))  // Use JWT authentication guard to ensure the user is authenticated before creating an account.  // Use the JwtStrategy to validate the JWT token and extract the user's ID.  // Pass the extracted user's ID as a parameter to the createAccount method.  // Pass the CreateAccountDto as the request body to populate the account's details.  // Return the result of the createAccount method.  // The API response will indicate whether the account
    async createAccount(@Request() req, @Body() dto: CreateAccountDto) {
      const userId = req.user.id;
        return this.accountService.createAccount(userId, dto);
    }
    
    @Get()
    @ApiOperation({ summary: 'Get all accounts for a user with totals' })
    @ApiResponse({ status: 200, description: 'Accounts retrieved successfully.' })
    @UseGuards(AuthGuard('jwt'))
    async getUserAccountsWithTotals(@Request() req) {
      const userId = req.user.id;
      return this.accountService.getUserAccountsWithTotals(userId);
    }
    
    @Get(':accountId')
    @ApiOperation({ summary: 'Get a specific account for a user' })
    @ApiResponse({ status: 200, description: 'Account retrieved successfully.' })
    @UseGuards(AuthGuard('jwt'))
    async getUserAccount(@Request() req, @Param('accountId') accountId: string,) {
      const userId = req.user.id;
      return this.accountService.getUserAccount(userId, accountId);
    }
}