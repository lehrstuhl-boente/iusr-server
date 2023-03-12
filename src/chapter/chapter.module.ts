import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';

@Module({
  providers: [ChapterService],
  controllers: [ChapterController],
})
export class ChapterModule {}
