import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min
} from 'class-validator';

export class ServiceDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\u0600-\u06FF\s]+$/, { message: 'Name (Ar) must contain Arabic characters only' })
  @MaxLength(100, { message: 'Name (Ar) must not exceed 100 characters' })
  name_ar: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name (En) must contain English characters only' })
  @MaxLength(100, { message: 'Name (En) must not exceed 100 characters' })
  name_en: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Hyphenated code must contain English characters and numbers only' })
  @MaxLength(50, { message: 'Hyphenated code must not exceed 50 characters' })
  hyphenated_sbs_code?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'code must contain English characters and numbers only' })
  @MaxLength(50, { message: 'Hyphenated code must not exceed 50 characters' })
  sbs_code: string;


  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Reference number must be numerical only' })
  @MaxLength(50, { message: 'Reference number must not exceed 50 characters' })
  reference_code?: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with up to 2 decimal places' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Description (Ar) must not exceed 100 characters' })
  description_ar?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9\s\W]+$/, { message: 'Description (En) must contain English characters, numbers, and special characters only' })
  @MaxLength(100, { message: 'Description (En) must not exceed 100 characters' })
  description_en?: string;
}
