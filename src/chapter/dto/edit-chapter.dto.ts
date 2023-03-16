import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;
}
