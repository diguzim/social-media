import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import type { API } from '@repo/contracts';

export class UpdateUserAlbumBodyDto implements API.UpdateUserAlbumBody {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }
    return typeof value === 'string' ? value.trim() : value;
  })
  description?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }

    return typeof value === 'string' ? value.trim() : value;
  })
  coverPhotoId?: string | null;
}
