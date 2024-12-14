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
import { ConfigService } from '@nestjs/config';
import { differenceInSeconds } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class  AuthService {
    private tempUserStore = new Map<string, { email: string; password: string; name: string }>();   
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly emailService: EmailService,
        private readonly otpService: OtpService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async registerUser(dto: UserRegisterDto): Promise<{ message: string }> {
        const { email, password, name} = dto;


        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const otp = await this.otpService.createOtp(email, OtpPurpose.SIGNUP);

            const sendEmailDto: SendEmailDto = {
                from: {
                    name: this.configService.get<string>('APP_NAME') || 'Spend-Wise',
                    address: this.configService.get<string>('FROM_EMAIL') || 'no-reply@spend-wise.com',
                },
                recipients: [{
                    name,
                    address: email,
                }],
                subject: 'Verify your email for Spend-Wise',
                html: `<p>Your OTP code is <strong>${otp.code}</strong>. It expires in 1 minute.</p>`,
            };
            await this.emailService.sendEmail(sendEmailDto);

            this.tempUserStore.set(email, { email, password: hashedPassword, name });

            return { message: 'User registered success. Please verify your email with the OTP sent.'};  
        } catch (error){
            console.log('Error registering user:', error);
            throw new InternalServerErrorException('Failed to create user');
        }; 
    }

    async verifyEmail(email: string, code: string): Promise<{ message: string }> {
        const tempUser = this.tempUserStore.get(email);
        if (!tempUser) {
            throw new BadRequestException('User not found or OTP expired. Please register again.');
        }

        const isValid = await this.otpService.verifyOtp(email, OtpPurpose.SIGNUP, code);
        if (isValid) {
            try {
                // Add user to the database
                await this.userService.create({
                    email: tempUser.email,
                    password: tempUser.password,
                    name: tempUser.name,
                });

                // Remove the temporary data
                this.tempUserStore.delete(email);

                return { message: 'Email verified and user registered successfully.' };
        } catch (error) {
            console.error('Error adding user to database:', error);
            throw new InternalServerErrorException('Failed to complete registration.');
            }
        }    
        throw new BadRequestException('Invalid OTP');
    }

    async resendOtp(email: string, purpose: OtpPurpose): Promise<{ message: string }> {
        // Check if an OTP already exists and is valid
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
                    `Please wait for ${Math.ceil(timeRemaining / 60)} minutes before requesting a new OTP.`
                );
            }
        }
    
        // Create and send a new OTP
        await this.otpService.createOtp(email, purpose);
        return { message: 'OTP has been resent successfully. Please check your email.' };
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
 