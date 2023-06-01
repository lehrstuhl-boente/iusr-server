import { BadRequestException, Injectable } from '@nestjs/common';
import { Lesson, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto, EditLessonDto, SubmitCodeDto } from './dto';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async getLesson(id: number, user: User) {
    const userLesson = await this.prisma.userLesson.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: id,
        },
      },
    });
    // if no userLesson exists for the current user and this lesson, create one
    if (!userLesson) {
      const lesson = await this.prisma.lesson.findUnique({
        where: {
          id,
        },
      });
      await this.prisma.userLesson.create({
        data: {
          userId: user.id,
          lessonId: id,
          code: lesson.code, // copy code from lesson to userLesson
        },
      });
    }
    const lesson: any = await this.prisma.lesson.findUnique({
      where: {
        id,
      },
      include: {
        userData: {
          where: {
            userId: user.id,
          },
        },
        chapter: true,
      },
    });
    lesson.next = await this.calculateNextLessonId(lesson);
    lesson.previous = await this.calculatePreviousLessonId(lesson);
    return lesson;
  }

  private async calculateNextLessonId(lesson: any) {
    const nextLesson = await this.prisma.lesson.findUnique({
      select: {
        id: true,
      },
      where: {
        position_chapterId: {
          chapterId: lesson.chapterId,
          position: lesson.position + 1,
        },
      },
    });
    // just take next lesson
    if (nextLesson) {
      return nextLesson.id;
    }
    // no next lesson --> get first lesson of next chapter
    const firstLessonOfNextChapter = await this.prisma.lesson.findFirst({
      select: {
        id: true,
      },
      where: {
        position: 1,
        chapter: {
          position: lesson.chapter.position + 1,
          courseId: lesson.chapter.courseId,
        },
      },
    });
    if (firstLessonOfNextChapter) {
      return firstLessonOfNextChapter.id;
    }
    // last lesson of last chapter
    return null;
  }

  private async calculatePreviousLessonId(lesson: any) {
    // first lesson of first chapter
    if (lesson.position === 1 && lesson.chapter.position === 1) {
      return null;
    }
    // first lesson of not first chapter --> get last lesson of previous chapter
    if (lesson.position === 1) {
      const lastLessonOfPrevChapter = await this.prisma.lesson.findFirst({
        select: {
          id: true,
        },
        where: {
          chapter: {
            position: lesson.chapter.position - 1,
            courseId: lesson.chapter.courseId,
          },
        },
        orderBy: {
          position: 'desc',
        },
      });
      return lastLessonOfPrevChapter.id;
    }
    // other lesson --> get lesson at previous position
    const prevLesson = await this.prisma.lesson.findUnique({
      select: {
        id: true,
      },
      where: {
        position_chapterId: {
          position: lesson.position - 1,
          chapterId: lesson.chapterId,
        },
      },
    });
    return prevLesson.id;
  }

  async createLesson(data: CreateLessonDto, user: User) {
    const countLessons = await this.prisma.lesson.count({
      where: {
        chapterId: data.chapterId,
      },
    });
    return this.prisma.lesson.create({
      data: {
        title: data.title,
        chapterId: data.chapterId,
        creatorId: user.id,
        position: countLessons + 1, // append at the end
      },
    });
  }

  async deleteLesson(id: number) {
    const deletedLesson = await this.prisma.lesson.delete({
      where: {
        id,
      },
    });
    // make position value of every successive lesson one smaller
    return await this.prisma.lesson.updateMany({
      where: {
        chapterId: deletedLesson.chapterId,
        position: {
          gt: deletedLesson.position, // gt = greater than
        },
      },
      data: {
        position: {
          decrement: 1,
        },
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
        solution: data.solution,
      },
    });
  }

  async moveUp(id: number) {
    // get lesson that should be moved (= moving lesson) to check if it's already at the top of the chapter
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
    await this.moveLesson(lesson, -1);
  }

  async moveDown(id: number) {
    // get lesson that should be moved (= moving lesson) to check if it's already at the end of the chapter
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
      },
    });
    const count = await this.prisma.lesson.count({
      where: {
        chapterId: lesson.chapterId,
      },
    });
    if (lesson.position === count) {
      throw new BadRequestException(
        'Cannot move lesson up when already at last position.',
      );
    }
    this.moveLesson(lesson, 1);
  }

  // TODO: reduce the number of queries (e.g. with batch queries)
  // -1: move up; 1: move down
  async moveLesson(lesson: Lesson, direction: 1 | -1) {
    const oldPosition = lesson.position;
    // change position of the moving lesson to 0 so that no duplicate position exists after updating preceding lesson (unique key contraint)
    await this.prisma.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        position: 0,
      },
    });
    // move the preceding/subsequent lesson one down/up (= old position of moving lesson)
    await this.prisma.lesson.update({
      where: {
        position_chapterId: {
          position: lesson.position + direction,
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
        id: lesson.id,
      },
      data: {
        position: oldPosition + direction,
      },
    });
  }

  async submitCode(lessonId: number, user: User, data: SubmitCodeDto) {
    // run code through judge0 api to get output

    // check if code is correct
    const completed = this.validateCode(data.code);

    // save code submitted by the user
    await this.prisma.userLesson.update({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
      data: {
        code: data.code,
        completed,
      },
    });
  }

  validateCode(code: string) {
    return true;
  }
}
