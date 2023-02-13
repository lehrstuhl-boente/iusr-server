import { IsNotEmpty, IsString } from 'class-validator';

export class CourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;
}
