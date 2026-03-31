import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UsernameParamDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  username!: string;
}
