
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config:ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      const { sub: id } = payload;
      const user = await this.prisma.user.findUnique({ where: { id } });
      // console.log("🚀 ~ file: Jwt.strategy.ts:22 ~ JwtStrategy ~ validate ~ user:", user)
      if (!user) throw new UnauthorizedException("User not found in jwt strategy");
      // return the user who make the requests
      // console.log("request made by :: ", user.username)
      return user; 
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
