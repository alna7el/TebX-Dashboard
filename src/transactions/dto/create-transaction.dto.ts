import { IsArray, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ProviderBranch } from 'src/branches/schema/branch.schema';

export class CreateTransactionDto {

  @IsNotEmpty()
  @IsEnum(['payment', 'refund'])
  type: string;

  @IsNotEmpty()
  @IsString()
  inv_number: string;

  @IsNotEmpty()
  @IsString()
  number: string;



  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  net_total: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tax: number

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsMongoId()
  patient: string;

  @IsNotEmpty()
  @IsMongoId()
  clinic: string;

  @IsNotEmpty()
  @IsMongoId()
  branch: ProviderBranch;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsMongoId({ each: true })
  services: string[];
}
