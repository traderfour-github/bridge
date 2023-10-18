import {IsString } from 'class-validator';

export class JoinDto {
  @IsString()
  token: string;

  @IsString()
  identity: string;
}
