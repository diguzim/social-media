import { IsNotEmpty, IsString } from 'class-validator';

export class PhotoIdParamDto {
  @IsString()
  @IsNotEmpty()
  photoId!: string;
}
