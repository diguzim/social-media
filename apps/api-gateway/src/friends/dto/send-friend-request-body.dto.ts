import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendFriendRequestBodyDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  targetUsername!: string;
}
