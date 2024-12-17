import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { AccountModule } from '../account/account.module';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/otp/otp.service';
import { EmailService } from 'src/email/email.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Account } from '@prisma/client';
@Module({
  imports: [ AccountModule, AuthModule, 
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const filename: string = `${uuidv4()}${path.extname(file.originalname)}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    })
   ],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService, AuthService, UserService, JwtService, OtpService, EmailService],
  exports: [TransactionService],
})
export class TransactionModule {}
