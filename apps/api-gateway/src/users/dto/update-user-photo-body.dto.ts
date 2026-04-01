import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import type { API } from '@repo/contracts';

export class UpdateUserPhotoBodyDto implements API.UpdateUserPhotoBody {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  albumId?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  description?: string | null;
}
