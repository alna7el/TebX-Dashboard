import { IsOptional } from 'class-validator';

export class ListUserDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  perPage?: number;

  @IsOptional()
  keyword?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  branch?: string;

  @IsOptional()
  speciality_id?: string;




  @IsOptional()
  role_id?: string;

  @IsOptional()
  last_active_from?: Date;

  @IsOptional()
  last_active_to?: Date;

  @IsOptional()
  created_at_from?: Date;

  @IsOptional()
  created_at_to?: Date;




}