import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserRegisterDto, UserLoginDto, VerifyOtpDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully. OTP sent to email.' })
    @ApiResponse({ status: 409, description: 'Email already in use.' })
    async register(@Body(ValidationPipe) userRegisterDto: UserRegisterDto) {
        return this.authService.registerUser(userRegisterDto);
    }

    @Post('verify-email')
    @ApiOperation({ summary: 'Verify user email with OTP' })
    @ApiResponse({ status: 200, description: 'Email verified successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
    async verifyEmail(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyEmail(verifyOtpDto.userId, verifyOtpDto.code);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user with email and password' })
    @ApiResponse({ status: 200, description: 'OTP sent to email for login.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body(ValidationPipe) userLoginDto: UserLoginDto) {
        return this.authService.login(userLoginDto);
    }

    @Post('verify-login-otp')
    @ApiOperation({ summary: 'Verify user OTP and receive JWT token' })
    @ApiResponse({ status: 200, description: 'Login successful. JWT token issued.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
    async verifyLoginOtp(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyLoginOtp(verifyOtpDto.userId, verifyOtpDto.code);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Send OTP to user email for password reset' })
    @ApiResponse({ status: 200, description: 'OTP sent to email for password reset.' })
    @ApiResponse({ status: 400, description: 'User with this email does not exist.' })
    async forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset user password with new password and OTP' })
    @ApiResponse({ status: 200, description: 'Password reset successful.' })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP.' })
    async resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
        const { userId, code, newPassword, retypeNewPassword } = resetPasswordDto;
        
        if (newPassword!== retypeNewPassword) {
            throw new BadRequestException('Passwords do not match.');
        }

        return this.authService.resetPassword(userId, code, newPassword);
    }
}
