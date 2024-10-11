import { IsEmail, IsNotEmpty, IsUUID, Length, MinLength, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterDto {
    @ApiProperty({ example: 'Ko Zin' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'kozin@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class UserLoginDto {
    @ApiProperty({ example: 'kozin@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    password: string;
}

export class VerifyOtpDto {
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @Length(6, 6)
    code: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'kozin@gmail.com' })
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsUUID()
    userId: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @Length(6, 6)
    code: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    retypeNewPassword: string;
}