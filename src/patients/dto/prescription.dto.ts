import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class MedicationDto {
  @IsNotEmpty()
  @IsString()
  medication_name: string;

  @IsNotEmpty()
  @IsNumber()
  dose: number;

  @IsNotEmpty()
  @IsString()
  dose_unit: string;

  @IsNotEmpty()
  @IsNumber()
  frequency: number;

  @IsNotEmpty()
  @IsString()
  frequency_unit: string;
}

export class PrescriptionDto {
  @IsNotEmpty()
  @IsString()
  patient: string;

  @IsMongoId()
  @IsNotEmpty()
  @IsString()
  appointment: string;


  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @IsOptional()
  @IsString()
  instructions: string;
}
