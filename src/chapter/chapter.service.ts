import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChapterDto, EditChapterDto } from './dto';

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
    const countChapters = await this.prisma.chapter.count({
      where: {
        courseId: data.courseId,
      },
    });
    return this.prisma.chapter.create({
      data: {
        title: data.title,
        description: data.description,
        position: countChapters + 1, // append at the end
        creatorId: user.id,
        courseId: data.courseId,
      },
    });
  }

  deleteChapter(id: number) {
    return this.prisma.chapter.delete({
      where: {
        id,
      },
    });
  }

  updateChapter(id: number, data: EditChapterDto) {
    return this.prisma.chapter.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }
}
