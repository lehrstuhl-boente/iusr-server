import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Get(':id')
  getCourse(
    @Param('id', new ParseIntPipe()) id: number,
    @GetUser() user: User,
  ) {
    return this.courseService.getCourseById(id, user);
  }

  @UseGuards(AdminGuard) // only logged in users that are admins can create courses
  @Post()
  createCourse(@Body() data: CourseDto, @GetUser() user: User) {
    return this.courseService.createCourse(data, user);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  updateCourse(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: CourseDto,
  ) {
    return this.courseService.updateCourse(id, data);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteCourse(@Param('id', new ParseIntPipe()) id: number) {
    return this.courseService.deleteCourse(id);
  }

  @UseGuards(AdminGuard)
  @Get(':id/chapters')
  getCourseChapters(@Param('id', new ParseIntPipe()) id: number) {
    return this.courseService.getChaptersByCourseId(id);
  }
}
