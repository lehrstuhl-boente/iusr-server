import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto, EditLessonDto } from './dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  getLesson(id: number) {
    return this.prisma.lesson.findUnique({
      where: {
        id,
      },
    });
  }

  createLesson(data: CreateLessonDto, user: User) {
    return this.prisma.lesson.create({
      data: {
        title: data.title,
        chapterId: data.chapterId,
        creatorId: user.id,
        position: 0,
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
        lang: data.lang,
        task: data.task,
        code: data.code,
      },
    });
  }

  async moveUp(id: number) {
    // get lesson that should be moved (= moving lesson) to check if it's already at the top
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
      },
    });
    if (lesson.position === 1) {
      throw new BadRequestException(
        'Cannot move lesson up when already at first position.',
      );
    }
    const oldPosition = lesson.position;
    // change position of the moving lesson to 0 so that no duplicate position exists after updating preceding lesson (unique key contraint)
    await this.prisma.lesson.update({
      where: {
        id,
      },
      data: {
        position: 0,
      },
    });
    // move the preceding lesson one down (= old position of moving lesson)
    await this.prisma.lesson.update({
      where: {
        position_chapterId: {
          position: lesson.position - 1,
          chapterId: lesson.chapterId,
        },
      },
      data: {
        position: oldPosition,
      },
    });
    // change moving lesson position from 0 to new position
    await this.prisma.lesson.update({
      where: {
        id,
      },
      data: {
        position: oldPosition - 1,
      },
    });
  }

  moveDown(id: number) {
    console.log('down', id);
  }
}
