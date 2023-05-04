import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  getAllCourses() {
    return this.prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

  getCourseById(id: number) {
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
