import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AdminGuard, UserGuard } from 'src/auth/guard';
import { CourseService } from './course.service';
import { CourseDto } from './dto';

@UseGuards(UserGuard) // only accessible by logged in users
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Get()
  getCourses() {
    return this.courseService.getAllCourses();
  }

  @UseGuards(AdminGuard) // only logged in users that are admins can create courses
  @Post()
  createCourse(@Body() data: CourseDto, @GetUser() user: User) {
    return this.courseService.createCourse(data, user);
  }
}
