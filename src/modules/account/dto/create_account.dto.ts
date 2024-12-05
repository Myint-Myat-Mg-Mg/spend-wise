import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";
import { AccountType, AccountSubType } from "@prisma/client";

export class CreateAccountDto {
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty()
    @IsEnum(AccountType)
    accountType: AccountType;
    
    @ApiProperty()
    @IsEnum(AccountSubType)
    accountSubType: AccountSubType;

    @ApiProperty()
    @IsInt()
    @Min(0)
    balance: number;
}