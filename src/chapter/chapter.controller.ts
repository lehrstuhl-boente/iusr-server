import {
  Body,
  Controller,
  Delete,
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
import { ChapterService } from './chapter.service';
import { ChapterDto, EditChapterDto } from './dto';

@UseGuards(UserGuard)
@Controller('chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @UseGuards(AdminGuard)
  @Post()
  createChapter(@Body() data: ChapterDto, @GetUser() user: User) {
    return this.chapterService.createChapter(data, user);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteChapter(@Param('id', new ParseIntPipe()) id: number) {
    return this.chapterService.deleteChapter(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  updateChapter(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: EditChapterDto,
  ) {
    return this.chapterService.updateChapter(id, data);
  }

  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Patch(':id/up')
  moveUp(@Param('id', new ParseIntPipe()) id: number) {
    return this.chapterService.moveUp(id);
  }

  @UseGuards(AdminGuard)
  @HttpCode(204)
  @Patch(':id/down')
  moveDown(@Param('id', new ParseIntPipe()) id: number) {
    return this.chapterService.moveDown(id);
  }
}
