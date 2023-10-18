import { IsNotEmpty, Length } from 'class-validator';

export class MqlRequestDto {
  @IsNotEmpty()
  data: object;
}
