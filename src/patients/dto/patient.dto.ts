import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsPhoneNumber } from '../../common/validators/is-phone-number.decorator';
import { Is10DigitId } from "src/common/validators/is-10-digit-id.decorator";
import { Transform } from "class-transformer";
import { IsBeforeTodayDate } from "src/common/validators/is-before-today-date";

export class PatientDto {
  @IsNotEmpty()
  @IsString()
  first_name_ar: string;

  @IsOptional()
  second_name_ar: string;

  @IsOptional()
  third_name_ar: string;

  @IsNotEmpty()
  @IsString()
  last_name_ar: string;

  @IsNotEmpty()
  @IsString()
  first_name_en: string;

  @IsOptional()
  second_name_en: string;

  @IsOptional()
  third_name_en: string;

  @IsNotEmpty()
  @IsString()
  last_name_en: string;

  @IsNotEmpty()
  @IsPhoneNumber({ message: 'Please provide a valid phone number' })
  phone: string;

  @IsOptional()
  @IsPhoneNumber({ message: 'Please provide a valid phone number' })
  secondary_phone: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsBeforeTodayDate()
  date_of_birth: Date;

  @IsOptional()
  address: string
  @IsOptional()
  country_id: string
  @IsOptional()
  city_id: string
  @IsNotEmpty()
  @IsString()
  national_id_type: string;

  @IsNotEmpty()
  @IsString()
  @Is10DigitId({ message: 'National ID must be exactly 10 digits' })
  national_id: string;

  @IsNotEmpty()
  @IsString()
  national_id_expiry: string;
  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  @IsString()
  nationality: string;

  @IsOptional()
  @IsString()
  marital_status: string;

}