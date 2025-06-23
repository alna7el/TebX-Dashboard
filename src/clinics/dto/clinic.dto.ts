import { IsNotEmpty, IsString } from "class-validator";

export class ClinicDto {

  @IsNotEmpty()
  @IsString()
  readonly name_ar: string;

  @IsNotEmpty()
  @IsString()
  readonly name_en: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

}