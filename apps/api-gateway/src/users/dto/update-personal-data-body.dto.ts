import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { API } from '@repo/contracts';

export class UpdatePersonalDataBodyDto
  implements API.UpdateMyPersonalDataRequest
{
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @IsEnum(API.ProfileGender)
  gender!: API.ProfileGender;

  @IsString()
  @MaxLength(2000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  about!: string;
}
