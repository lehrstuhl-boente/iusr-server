import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

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
}
