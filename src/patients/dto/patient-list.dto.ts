import { IsOptional } from "class-validator";

export class PatientListDto {

  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  sortDirection?: string;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  phone?: string;



}