import { Injectable,BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OtpPurpose, Otp, Prisma } from '@prisma/client';
import { addMinutes } from 'date-fns';

@Injectable()
export class OtpService {
    constructor(private prisma: PrismaService) {}

    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async createOtp(userId: string, purpose: OtpPurpose): Promise<Otp> {
        const code = this.generateOTP();
        const expiresAt = addMinutes(new Date(), 10);

        await this.prisma.otp.deleteMany({
            where: {
                userId,
                purpose,
            },
        });
 
        const otp = await this.prisma.otp.create({
            data: {
                code,
                purpose,
                expiresAt,
                userId,
            },
        });

        return otp;
    }

    async verifyOtp(userId: string, purpose: OtpPurpose, code: string): Promise<boolean> {
        const otp = await this.prisma.otp.findFirst({
            where: {
                userId,
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
}
