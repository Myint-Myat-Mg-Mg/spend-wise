import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { WalletController } from './modules/wallet/wallet.controller';
import { WalletService } from './modules/wallet/wallet.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './modules/user/user.module';
import { OtpModule } from './otp/otp.module';
import { TransactionModule } from './modules/transation/transaction.module';
import { AccountModule } from './modules/account/account.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['.env'],
    validationSchema: Joi.object({
      PORT: Joi.number().default(3000),
      DATABASE_URL: Joi.string().required(),
      EMAIL_HOST: Joi.string().required(),
      EMAIL_PORT: Joi.number().required(),
      EMAIL_USER: Joi.string().required(),
      EMAIL_PASS: Joi.string().required(),
      FROM_EMAIL: Joi.string().email().required(),
      JWT_SECRET: Joi.string().required(),
      JWT_EXPIRATION: Joi.string().default('3600s')
    }),
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '60m' },
    }),
    inject: [ConfigService],
  }),
  AuthModule,
  UserModule,
  WalletModule, 
  PrismaModule, 
  EmailModule, 
  OtpModule,
  TransactionModule,
  AccountModule,
],
  controllers: [AppController],
  providers: [AppService, AuthMiddleware],
}) 
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
