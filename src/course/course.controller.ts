import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AdminGuard, JwtGuard } from 'src/auth/guard';
import { CourseService } from './course.service';
import { CourseDto } from './dto';

@UseGuards(JwtGuard) // only accessible by logged in users
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @UseGuards(AdminGuard) // only logged in users that are admins
  @Get()
  getCourses() {
    return this.courseService.getAllCourses();
  }

  @Post()
  createCourse(@Body() data: CourseDto, @GetUser() user: User) {
    return this.courseService.createCourse(data, user);
  }
}
