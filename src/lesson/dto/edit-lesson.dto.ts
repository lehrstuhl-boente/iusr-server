import { IsNumber, IsString } from 'class-validator';

export class EditLessonDto {
  @IsString()
  title: string;

  @IsNumber()
  chapterId: number;
}
