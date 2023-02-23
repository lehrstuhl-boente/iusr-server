import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
@Injectable({})
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: AuthDto) {
    try {
      const hash = await argon.hash(data.password);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      // if error was thrown by prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: unique contraint failed, here: user with provided email already exists
        // list of prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code == 'P2002') {
          throw new ForbiddenException('User with email already exists.'); // nest.js 403 error
        }
      }
      throw error; // throw if it's an unexpected error
    }
  }

  async login(data: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    // if user with email cannot be found or passwords don't match
    if (!user || !(await argon.verify(user.password, data.password))) {
      throw new ForbiddenException('Credentials incorrect.');
    }
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const token: String = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      accessToken: token,
    };
  }
}
