import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CourseDto } from './dto';

@Injectable()
export class CourseService {
  getAllCourses() {}

  createCourse(data: CourseDto, user: User) {
    console.log(data, user);
  }
}
