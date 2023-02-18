import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(UserGuard)
@Controller('users')
export class UserController {
  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }
}
