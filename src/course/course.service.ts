import { Injectable, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseDto } from './dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  getAllCourses() {}

  createCourse(data: CourseDto, user: User) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: user.id,
      },
    });
  }
}
