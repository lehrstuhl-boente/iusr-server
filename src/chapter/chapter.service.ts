import { BadRequestException, Injectable } from '@nestjs/common';
import { Chapter, Prisma, User } from '@prisma/client';
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

  async deleteChapter(id: number) {
    const deletedChapter = await this.prisma.chapter.delete({
      where: {
        id,
      },
    });
    // make position value of every successive chapter one smaller
    return await this.prisma.chapter.updateMany({
      where: {
        courseId: deletedChapter.courseId,
        position: {
          gt: deletedChapter.position, // gt = greater than
        },
      },
      data: {
        position: {
          decrement: 1,
        },
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

  async moveUp(id: number) {
    // get chapter that should be moved (= moving chapter) to check if it's already at the top of the chapter
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id,
      },
    });
    if (chapter.position === 1) {
      throw new BadRequestException(
        'Cannot move chapter up when already at first position.',
      );
    }
    await this.moveChapter(chapter, -1);
  }

  async moveDown(id: number) {
    // get chapter that should be moved (= moving chapter) to check if it's already at the end of the chapter
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id,
      },
    });
    const count = await this.prisma.chapter.count({
      where: {
        courseId: chapter.courseId,
      },
    });
    if (chapter.position === count) {
      throw new BadRequestException(
        'Cannot move chapter up when already at last position.',
      );
    }
    this.moveChapter(chapter, 1);
  }

  // -1: move up; 1: move down
  async moveChapter(chapter: Chapter, direction: 1 | -1) {
    const oldPosition = chapter.position;
    // change position of the moving chapter to 0 so that no duplicate position exists after updating preceding chapter (unique key contraint)
    await this.prisma.chapter.update({
      where: {
        id: chapter.id,
      },
      data: {
        position: 0,
      },
    });
    // move the preceding/subsequent chapter one down/up (= old position of moving chapter)
    await this.prisma.chapter.update({
      where: {
        position_courseId: {
          position: chapter.position + direction,
          courseId: chapter.courseId,
        },
      },
      data: {
        position: oldPosition,
      },
    });
    // change moving chapter position from 0 to new position
    await this.prisma.chapter.update({
      where: {
        id: chapter.id,
      },
      data: {
        position: oldPosition + direction,
      },
    });
  }
}
