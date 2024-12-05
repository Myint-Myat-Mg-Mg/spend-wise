import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { EmailService } from 'src/email/email.service';
import { UserRegisterDto, UserLoginDto } from './dto/auth.dto'; 
import { Prisma, User } from '@prisma/client';
import { OtpService } from 'src/otp/otp.service';
import { OtpPurpose } from '@prisma/client';
import { SendEmailDto } from 'src/email/email.interface';
import { promises } from 'dns';
import { retry } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { isThursday } from 'date-fns';

@Injectable()
export class  AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
        private readonly configService: ConfigService,
    ) {}

    async registerUser(dto: UserRegisterDto): Promise<{ message: string }> {
        const { email, password, name} = dto;


        const existingUser = await this.userService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user: User = await this.userService.create({
                email,
                password: hashedPassword,
                name,
            });

            const otp = await this.otpService.createOtp(user.id, OtpPurpose.SIGNUP);

            const sendEmailDto: SendEmailDto = {
                from: {
                    name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                    address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
                },
                recipients: [{
                    name: user.name,
                    address: user.email,
                }],
                subject: 'Verify your email for Spend-Wise',
                html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
            };
            await this.emailService.sendEmail(sendEmailDto);

            return { message: 'User registered successfully. Please verify your email with the OTP sent.'};  
        } catch (error){
            console.log('Error registering user:', error);
            throw new InternalServerErrorException('Failed to create user');
        }; 
    }

    async verifyEmail(email: string, code: string): Promise<{ message: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isValid = await this.otpService.verifyOtp(user.id, OtpPurpose.SIGNUP, code);
        if (isValid) {
            return { message: 'Email Verified successfully.'};
        }
        throw new BadRequestException('Invalid OTP');
    }

    async login(userLoginDto: UserLoginDto): Promise<{ access_token: string }> {
        const { email, password } = userLoginDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { username: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '3600s',
        });

        return { access_token };
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User with this email does not exist');
        }

        const otp = await this.otpService.createOtp(user.id, OtpPurpose.FORGOT_PASSWORD);

        const sendEmailDto: SendEmailDto = {
            from: {
                name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
            },
            recipients: [{
                name: user.name,
                address: user.email,
            }],
            subject: 'Reset your password for Spend-Wise',
            html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
        }
        await this.emailService.sendEmail(sendEmailDto);

        return { message: 'OTP sent to your email. Please verify to reset your password.'};
    }

    async verifyForgotPasswordOTP(code: string): Promise<{ resetToken: string }> {
        const otpDetails = await this.otpService.findByCode(code, OtpPurpose.FORGOT_PASSWORD);
    
        if (!otpDetails) {
            throw new BadRequestException('Invalid OTP or OTP has expired.');
        }
    
        const resetToken = this.jwtService.sign({userId: otpDetails.userId}, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m', // Reset token valid for 15 minutes
        });

        return  { resetToken };
    }

    async resetPassword( newPassword: string, confirmNewPassword: string, resetToken: string ): Promise<{ message: string }> {
        if (newPassword !== confirmNewPassword) {
          throw new BadRequestException('Passwords do not match');
        }
    
        try {
            const payload = this.jwtService.verify(resetToken, {
                secret: process.env.JWT_SECRET,
            });
    
            const userId = payload.userId;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userService.updatePassword(userId, hashedPassword);
    
            return { message: 'Password reset successfully.' };
        } catch (error) {
            console.log( error )
            throw new BadRequestException('Invalid or expired reset token');
        }  
    }
}
 