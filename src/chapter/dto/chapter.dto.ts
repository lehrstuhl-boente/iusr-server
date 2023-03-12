import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  courseId: number;
}
