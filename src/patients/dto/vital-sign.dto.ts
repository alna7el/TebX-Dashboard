import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class VitalSignDTO {

  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, {
    message: 'patient must be a valid MongoDB ObjectId',
  })
  patient: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  readonly date: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  readonly time: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}\.\d{1}$/, {
    message: 'height must be in the format of up to 3 digits and 1 decimal place',
  })
  readonly height: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}\.\d{1}$/, {
    message: 'weight must be in the format of up to 3 digits and 1 decimal place',
  })
  readonly weight: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}$/, {
    message: 'systolic_pressure must be an integer with up to 3 digits',
  })
  readonly systolic_pressure: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}$/, {
    message: 'diastolic_pressure must be an integer with up to 3 digits',
  })
  readonly diastolic_pressure: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}$/, {
    message: 'heart_rate must be an integer with up to 3 digits',
  })
  readonly heart_rate: string;

  @IsNotEmpty()
  @Matches(/^\d{2}$/, {
    message: 'oxygen_saturation must be an integer with up to 2 digits',
  })
  readonly oxygen_saturation: string;

  @IsNotEmpty()
  @Matches(/^\d{1,3}$/, {
    message: 'respiratory_rate must be an integer with up to 3 digits',
  })
  readonly respiratory_rate: string;

  @IsNotEmpty()
  @Matches(/^\d{1,2}\.\d{1}$/, {
    message: 'temperature must be in the format of up to 2 digits and 1 decimal place',
  })
  readonly temperature: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, {
    message: 'notes must not exceed 300 characters',
  })
  readonly notes: string;

  @IsNotEmpty()
  @IsString()
  readonly collected_by: string;
}
