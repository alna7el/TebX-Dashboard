import { IsOptional, IsString } from "class-validator";

export class AppointmentDto {

  @IsString()
  @IsOptional()
  readonly from_date: string;

  @IsString()
  @IsOptional()
  readonly to_date: string;



}