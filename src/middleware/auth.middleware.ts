import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { request } from 'http';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    use(req: any, res: any, next: () => void) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization token is missing');
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });
            req.user = payload;
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
