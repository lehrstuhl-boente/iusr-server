import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AdminGuard, UserGuard } from 'src/auth/guard';
import { CreateLessonDto, EditLessonDto, SubmitCodeDto } from './dto';
import { LessonService } from './lesson.service';

@UseGuards(UserGuard)
@Controller('lessons')
export class LessonController {
  constructor(private lessonService: LessonService) {}

  @Get(':id')
  getLesson(
    @Param('id', new ParseIntPipe()) id: number,
    @GetUser() user: User,
  ) {
    return this.lessonService.getLesson(id, user);
  }

  @Post(':id')
  @HttpCode(200)
  submitCode(
    @Param('id', new ParseIntPipe()) id: number,
    @GetUser() user: User,
    @Body() data: SubmitCodeDto,
  ) {
    return this.lessonService.submitCode(id, user, data);
  }

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

  @UseGuards(AdminGuard)
  @Patch(':id')
  updateLessonMeta(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: EditLessonDto,
  ) {
    return this.lessonService.updateLesson(id, data);
  }

  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Patch(':id/up')
  moveUp(@Param('id', new ParseIntPipe()) id: number) {
    return this.lessonService.moveUp(id);
  }

  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Patch(':id/down')
  moveDown(@Param('id', new ParseIntPipe()) id: number) {
    return this.lessonService.moveDown(id);
  }
}
