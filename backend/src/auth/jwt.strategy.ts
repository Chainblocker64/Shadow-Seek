import { Injectable, Logger } from '@nestjs/common';
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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      new Logger(JwtStrategy.name).error(
        'FATAL ERROR: JWT_SECRET environment variable is not defined.',
      );
      process.exit(1);
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const req = request as RequestWithCookies;
          return req.cookies?.access_token ?? null;
        },
      ]),
      secretOrKey: secret,
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
