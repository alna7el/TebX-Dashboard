import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class DiagnosisDTO {

  @IsNotEmpty()
  @IsString()
  patient: string

  @IsNotEmpty()
  @IsString()
  readonly initial: string;

  @IsArray()
  @IsNotEmpty()
  readonly secondary: string;

  @IsArray()
  @IsNotEmpty()
  readonly differential: string;

  @IsString()
  @IsOptional()
  readonly notes: string;


}