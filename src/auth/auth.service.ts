import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
      });
      delete user.password; // don't return the hashed password
      return user;
    } catch (error) {
      // if error was thrown by prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: unique contraint failed, here: user with provided email already exists
        // list of prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
        if (error.code == 'P2002') {
          throw new ForbiddenException('User with email already exists.'); // nest.js 403 error type
        }
      }
      throw error; // throw if it's an unexpected error
    }
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user || !(await argon.verify(user.password, dto.password))) {
      throw new ForbiddenException('Credentials incorrect.');
    }
    delete user.password;
    return user;
  }
}
