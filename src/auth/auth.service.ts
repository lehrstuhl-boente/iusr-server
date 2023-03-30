import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { Prisma, User } from '@prisma/client';
@Injectable({})
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      if (data.password !== data.passwordRepeat) {
        throw new BadRequestException(['passwords do not match']);
      }
      const hash = await argon.hash(data.password);
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hash,
        },
      });
      return this.signToken(user);
    } catch (error) {
      // if error was thrown by prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: unique contraint failed, here: user with provided email already exists
        // list of prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code == 'P2002') {
          throw new ForbiddenException({
            email: 'user with email already exists', // the object key is the name of the frontend field
          }); // nest.js 403 error
        }
      }
      throw error; // throw if it's an unexpected error or BadRequestException (= not same passwords)
    }
  }

  async login(data: LoginDto) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    // if user with email cannot be found or passwords don't match
    if (!user || !(await argon.verify(user.password, data.password))) {
      throw new ForbiddenException(['credentials incorrect']);
    }
    return this.signToken(user);
  }

  async signToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token: String = await this.jwt.signAsync(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    delete user.password;

    return {
      ...user,
      accessToken: token,
    };
  }
}
