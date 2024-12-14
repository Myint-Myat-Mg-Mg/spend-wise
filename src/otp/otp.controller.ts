import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpPurpose } from '@prisma/client';

@Controller('otp')
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post('resend-otp')
    async resendOtp(
        @Body('email') email: string,
        @Body('purpose') purpose: OtpPurpose
    ): Promise<{ message: string }> {
        const otp = await this.otpService.resendOtp(email, purpose);

        // Optionally send the OTP via email
        // Example: sendEmail({ email, otp.code });

        return { message: 'OTP resent successfully. Please check your email.' };
    }
}
