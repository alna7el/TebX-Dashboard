import { IsOptional } from "class-validator";

export class AppointmentFiltersDto {
  @IsOptional()
  branch?: string;

  @IsOptional()
  clinic?: string;

  @IsOptional()
  patient?: string;

  @IsOptional()
  appointment_date_from?: string;

  @IsOptional()
  appointment_date_to?: string;



} 