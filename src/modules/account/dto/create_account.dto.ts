import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { AccountType, AccountSubType } from "@prisma/client";

export class CreateAccountDto {
    
    @ApiProperty({ description: 'Name of the account'})
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({ description: 'Type of the account', enum: AccountType })
    @IsEnum(AccountType)
    accountType: AccountType;
    
    @ApiProperty({ description: 'Subtype of the account', enum: AccountSubType })
    @IsEnum(AccountSubType)
    accountSubType: AccountSubType;

    @ApiProperty({ description: 'Initial balance of the account' })
    @IsInt()
    @Min(0)
    balance: number;
}