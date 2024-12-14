import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpPurpose, Otp, Prisma } from '@prisma/client';
import { addMinutes, differenceInSeconds } from 'date-fns';
import { EmailModule } from '../email/email.module';

@Injectable()
export class OtpService {
    constructor(private prisma: PrismaService) {}

    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createOtp(email: string, purpose: OtpPurpose): Promise<Otp> {
        const code = this.generateOTP();
        const expiresAt = addMinutes(new Date(), 10);

        await this.prisma.otp.deleteMany({
            where: {
                email,
                purpose,
            },
        });
 
        const otp = await this.prisma.otp.create({
            data: {
                code,
                purpose,
                expiresAt,
                email,
            },
        });

        return otp;
    }

    async findByCode(code: string, purpose: OtpPurpose): Promise<Otp | null> {
        const otp = await this.prisma.otp.findFirst({
            where: {
                code,
                purpose,
                expiresAt: { gte: new Date() },
            },
        });

        return otp;
    }

    async verifyOtp(email: string, purpose: OtpPurpose, code: string): Promise<boolean> {
        const otp = await this.prisma.otp.findFirst({
            where: {
                email,
                purpose,
                code,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if(!otp) {
            throw new BadRequestException('Invalid or expired otp');
        }

        if (otp) {
            // Optionally, delete the OTP after verification to prevent reuse
            await this.prisma.otp.delete({
              where: { id: otp.id },
            });
            return true;
          }
          return false;
    }

    async resendOtp(email: string, purpose: OtpPurpose): Promise<Otp> {
        const existingOtp = await this.prisma.otp.findFirst({
            where: {
                email,
                purpose,
                expiresAt: {
                    gt: new Date(), // Ensure OTP hasn't expired
                },
            },
        });

        if (existingOtp) {
            const timeRemaining = differenceInSeconds(existingOtp.expiresAt, new Date());

            // Prevent frequent OTP resends
            if (timeRemaining > 60) {
                throw new BadRequestException(
                    `Please wait for ${Math.ceil(timeRemaining / 10)} minutes before requesting a new OTP.`
                );
            }
        }

        // Create and return a new OTP
        return this.createOtp(email, purpose);
    }
}
