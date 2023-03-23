import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AdminGuard, UserGuard } from 'src/auth/guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { LessonService } from './lesson.service';

@UseGuards(UserGuard)
@Controller('lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @UseGuards(AdminGuard)
  @Post()
  createLesson(@Body() data: CreateLessonDto, @GetUser() user: User) {
    return this.lessonService.createLesson(data, user);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteLesson(@Param('id', new ParseIntPipe()) id: number) {
    return this.lessonService.deleteLesson(id);
  }
}
