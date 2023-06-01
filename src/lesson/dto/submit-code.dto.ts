import { IsOptional, IsString } from 'class-validator';

export class SubmitCodeDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsString()
  lang: string;
}
