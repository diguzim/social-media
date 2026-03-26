import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import type { API } from '@repo/contracts';

export class LoginBodyDto implements API.LoginRequest {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
