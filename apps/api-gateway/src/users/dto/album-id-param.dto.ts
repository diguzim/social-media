import { IsNotEmpty, IsString } from 'class-validator';

export class AlbumIdParamDto {
  @IsString()
  @IsNotEmpty()
  albumId!: string;
}
