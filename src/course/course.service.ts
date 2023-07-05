import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async getAllCourses(user: User) {
    const courses = await this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // add how many lectures are in the course and how many lectures the user has completed
    const couresWithProgress = [];
    for (const course of courses) {
      const progressObject = await this.calculateCourseProgress(
        course.id,
        user.id,
      );
      Object.assign(course, progressObject);
      couresWithProgress.push(course);
    }
    return couresWithProgress;
  }

  async calculateCourseProgress(courseId: number, userId: number) {
    const lessonsTotal = await this.prisma.lesson.count({
      where: {
        chapter: {
          courseId,
        },
      },
    });
    const lessonsCompleted = await this.prisma.userLesson.count({
      where: {
        userId,
        completed: true,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
    });
    return {
      lessonsTotal,
      lessonsCompleted,
    };
  }

  createCourse(data: CourseDto, user: User) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: user.id,
      },
    });
  }

  getCourseById(id: number, user: User) {
    return this.prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        chapters: {
          orderBy: {
            position: 'asc',
          },
          include: {
            lessons: {
              orderBy: {
                position: 'asc',
              },
              include: {
                userData: {
                  select: {
                    completed: true,
                  },
                  where: {
                    userId: user.id,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  updateCourse(id: number, data: CourseDto) {
    return this.prisma.course.update({
      where: {
        id,
      },
      data: {
        title: data.title,
        description: data.description,
      },
    });
  }

  deleteCourse(id: number) {
    return this.prisma.course.delete({
      where: {
        id,
      },
    });
  }

  getChaptersByCourseId(id: number) {
    return this.prisma.chapter.findMany({
      where: {
        courseId: id,
      },
    });
  }
}
