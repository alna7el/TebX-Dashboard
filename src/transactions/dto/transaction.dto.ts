import { IsOptional } from "class-validator";

export class TransactionDto {

  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  date_from?: string;

  @IsOptional()
  date_to?: string;



}