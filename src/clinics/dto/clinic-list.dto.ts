import { IsOptional } from "class-validator";

export class ClinicListDto {

  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  branch?: string;

  @IsOptional()
  keyword?: string



}