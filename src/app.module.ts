import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { ChapterController } from './chapter/chapter.controller';
import { ChapterService } from './chapter/chapter.service';
import { ChapterModule } from './chapter/chapter.module';
import { LessonModule } from './lesson/lesson.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CourseModule,
    ChapterModule,
    LessonModule,
  ],
  controllers: [UserController, ChapterController],
  providers: [UserService, ChapterService],
})
export class AppModule {}
