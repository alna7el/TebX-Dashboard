import { Type } from "class-transformer";
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";

class SlotDto {
  @IsNotEmpty()
  @IsString()
  start_time: string;
  @IsNotEmpty()
  @IsString()
  end_time: string;
}

class WorkdayDto {
  @IsNotEmpty()
  @IsString()
  day: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotDto)
  slots: SlotDto[];
}
export class createUserDto {

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly firstNameAR: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastNameAR: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;

  @IsNotEmpty()
  readonly role_id: string;

  @IsNotEmpty()
  @IsString()
  readonly username: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  password: string;

  @IsString()
  readonly gender: string;

  @IsNotEmpty()
  @IsString()
  readonly status: string;

  @IsNotEmpty()
  readonly birthDate: string;

  @IsOptional()
  keycloak_id: string

  @ValidateIf((dto) => dto.role_id === '6728ed7cf72d5c9803fe1130') //modified to be dynamic
  @IsNotEmpty()
  readonly speciality: string;

  @IsNotEmpty()
  @IsMongoId()
  branch: string

  @IsNotEmpty()
  @IsArray()
  clinics: string

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkdayDto)
  readonly work_schedule?: WorkdayDto[];



}