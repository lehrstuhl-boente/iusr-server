import { IsOptional } from 'class-validator';

export class SubmitCodeDto {
  @IsOptional()
  code: string;
}
