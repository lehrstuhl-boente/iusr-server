import { BadRequestException, Injectable } from '@nestjs/common';
import { Lesson, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto, EditLessonDto, SubmitCodeDto } from './dto';
import * as stripComments from 'strip-comments';
import * as prettier from 'prettier';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

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
    const userLesson = await this.prisma.userLesson.findUnique({
      select: {
        completed: true,
      },
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    // check if code is correct
    const codeCorrect = await this.validateCode(lessonId, data.code);

    // run code with judge0
    const codeResult = await this.runCode(data.code, data.lang);

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
        completed: userLesson.completed === true ? true : codeCorrect, // if lesson was already completed, keep it completed
      },
    });

    return {
      isCorrect: codeCorrect,
      result: codeResult,
    };
  }

  private async validateCode(lessonId: number, code: string) {
    // get solution and compare with code submitted by user
    const lesson = await this.prisma.lesson.findUnique({
      select: {
        solution: true,
        lang: true,
      },
      where: {
        id: lessonId,
      },
    });

    // TODO DIRTY FIX: remove comments from r code as if the code was in python
    let stripCommentsLanguage = lesson.lang;
    if (lesson.lang === 'r') {
      stripCommentsLanguage = 'python';
    }

    // remove line and block comments from code and solution
    const commentFreeCode = stripComments.default(code, {
      language: stripCommentsLanguage,
    });
    const commentFreeSolution = stripComments.default(lesson.solution, {
      language: stripCommentsLanguage,
    });

    // format code and solution with prettier to make them comparable (e.g. they may have different indent sizes)
    let formattedCode = commentFreeCode;
    let formattedSolution = commentFreeSolution;
    try {
      formattedCode = prettier.format(commentFreeCode, { parser: 'babel' });
      formattedSolution = prettier.format(commentFreeSolution, {
        parser: 'babel',
      });
    } catch (e) {
      // syntax error in code --> don't format
    }

    return formattedCode === formattedSolution;
  }

  private async runCode(code: string, lang: string) {
    // map language string to id: https://github.com/judge0/judge0/blob/master/CHANGELOG.md#new-features-6 and https://github.com/judge0/judge0/blob/master/CHANGELOG.md#new-features-8
    const languageIds = {
      c: 50,
      'c#': 51,
      'c++': 54,
      java: 62,
      javascript: 63,
      php: 68,
      python: 71,
      typescript: 74,
      r: 80,
      sql: 82,
    };

    const baseUrl = this.config.get('JUDGE0_URL');
    const url = baseUrl + '/submissions/?base64_encoded=false&wait=true';
    const headers = {
      'content-type': 'application/json',
    };
    const body = {
      source_code: code,
      language_id: languageIds[lang],
    };
    try {
      const res = await axios.post(url, body, { headers });
      return res.data;
    } catch (e: any) {
      return e.response.data;
    }
  }
}
