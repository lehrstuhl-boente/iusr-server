import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ChangePasswordDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async changePassword(user: User, data: ChangePasswordDto) {
    const dbUser: User = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    if (!bcrypt.compareSync(data.oldPassword, dbUser.password)) {
      throw new BadRequestException(['Old password is incorrect.']);
    }
    if (data.newPassword !== data.confirmNewPassword) {
      throw new BadRequestException(['Passwords do not match.']);
    }
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: bcrypt.hashSync(data.newPassword),
      },
    });
  }
}
