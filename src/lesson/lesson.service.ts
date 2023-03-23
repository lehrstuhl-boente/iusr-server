import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto, EditLessonDto } from './dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  createLesson(data: CreateLessonDto, user: User) {
    return this.prisma.lesson.create({
      data: {
        title: data.title,
        chapterId: data.chapterId,
        creatorId: user.id,
      },
    });
  }

  deleteLesson(id: number) {
    return this.prisma.lesson.delete({
      where: {
        id,
      },
    });
  }

  updateLesson(id: number, data: EditLessonDto) {
    return this.prisma.lesson.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        chapterId: data.chapterId,
      },
    });
  }
}
