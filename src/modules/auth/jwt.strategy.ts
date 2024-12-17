import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('Invalid token');
        }
        return user;
    }

}

