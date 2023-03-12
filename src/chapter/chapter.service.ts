import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChapterDto } from './dto';

@Injectable()
export class ChapterService {
  constructor(private prisma: PrismaService) {}

  async createChapter(data: ChapterDto, user: User) {
    // check if course with given ID exists
    const countCourse = await this.prisma.course.count({
      where: {
        id: data.courseId,
      },
    });
    if (countCourse === 0) {
      throw new BadRequestException([
        'Course with ID ' + data.courseId + ' does not exist.',
      ]);
    }

    return this.prisma.chapter.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: user.id,
        courseId: data.courseId,
      },
    });
  }
}
