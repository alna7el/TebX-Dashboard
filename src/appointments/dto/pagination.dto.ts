import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

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

  @IsOptional()
  keyword?: string;


  @IsOptional()
  is_waiting_list?: string;

  @IsOptional()
  is_emergency?: string;






}