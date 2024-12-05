import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { EmailService } from 'src/email/email.service';
import { multerConfig } from 'src/config/upload.config';

@Module({
  imports: [ AuthModule, multerConfig ],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService, AuthService, UserService, JwtService, OtpService, EmailService],
  exports: [TransactionService],
})
export class TransactionModule {}
