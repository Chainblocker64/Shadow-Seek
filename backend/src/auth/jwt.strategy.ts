import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

interface RequestWithCookies extends Request {
  cookies: {
    access_token?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const req = request as RequestWithCookies;
          return req.cookies?.access_token ?? null;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET ?? 'fallback_secret_value',
    });
  }

  validate(payload: { sub: string; username: string }): {
    userId: string;
    username: string;
  } {
    return {
      userId: payload.sub,
      username: payload.username,
    };
  }
}
