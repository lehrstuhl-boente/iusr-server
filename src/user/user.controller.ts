import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto';

@UseGuards(UserGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }

  @Put('password')
  changePassword(@GetUser() user: User, @Body() data: ChangePasswordDto) {
    return this.userService.changePassword(user, data);
  }
}
