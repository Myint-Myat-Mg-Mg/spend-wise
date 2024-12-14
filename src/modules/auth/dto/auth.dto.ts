import { IsEmail, IsNotEmpty, IsUUID, Length, MinLength, Matches, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { OtpPurpose } from "@prisma/client";

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
    @ApiProperty({ example: "kozin@gmail.com"})
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456' })
    @IsNotEmpty()
    @Length(6, 6)
    code: string;
}

export class ResentOtp{
    @ApiProperty({ example: 'kozin@gmail.com' })
    @IsEmail()
    email: string;

    @ApiProperty ({ example: "SIGNUP" })
    @IsEnum(OtpPurpose)
    purpose: OtpPurpose;
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'kozin@gmail.com' })
    @IsEmail()
    email: string;
}

export class VerifyForgotPasswordOtpDto {
    @ApiProperty({ example: '123456', description: 'OTP code sent to email' })
    @IsNotEmpty()
    @Length(6, 6, { message: 'OTP code must be exactly 6 characters.' })
    code: string;
  }

export class ResetPasswordDto {
    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    newPassword: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    comfirmNewPassword: string;

    resetToken: string;
}