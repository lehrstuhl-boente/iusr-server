import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditLessonDto {
  @IsString()
  title: string;

  @IsNumber()
  chapterId: number;

  @IsString()
  @IsOptional()
  lang: string;

  @IsString()
  @IsOptional()
  task: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  solution: string;
}
