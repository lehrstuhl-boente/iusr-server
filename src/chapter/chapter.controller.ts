import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { AdminGuard, UserGuard } from 'src/auth/guard';
import { ChapterService } from './chapter.service';
import { ChapterDto } from './dto';

@UseGuards(UserGuard)
@Controller('chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @UseGuards(AdminGuard)
  @Post()
  createChapter(@Body() data: ChapterDto, @GetUser() user: User) {
    return this.chapterService.createChapter(data, user);
  }
}
