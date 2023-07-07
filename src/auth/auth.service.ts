import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable({})
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(data: RegisterDto) {
    try {
      if (data.password !== data.confirmPassword) {
        throw new BadRequestException(['Passwords do not match.']);
      }
      const hash = bcrypt.hashSync(data.password);
      const user = await this.prisma.user.create({
        data: {
          username: data.username,
          password: hash,
        },
      });
      return this.signToken(user);
    } catch (error) {
      // if error was thrown by prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: unique contraint failed, here: user with provided username already exists
        // list of prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code == 'P2002') {
          throw new BadRequestException(['Username already taken.']); // nest.js 403 error
        }
      }
      throw error; // throw if it's an unexpected error or BadRequestException (= not same passwords)
    }
  }

  async login(data: LoginDto) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });
    // if user with username cannot be found or passwords don't match
    if (!user || !bcrypt.compareSync(data.password, user.password)) {
      throw new ForbiddenException(['Credentials incorrect.']);
    }
    return this.signToken(user);
  }

  async signToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
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
