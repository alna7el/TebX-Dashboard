import { IsArray, IsMongoId, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TimeSlotDto {
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @IsString()
  @IsNotEmpty()
  end_time: string;
}

class WorkScheduleDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots: TimeSlotDto[];
}

export class CreateClinicUserWorkingHoursDto {
  @IsMongoId()
  @IsNotEmpty()
  doctor_id: string;

  @IsMongoId()
  @IsNotEmpty()
  clinic_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkScheduleDto)
  work_schedule: WorkScheduleDto[];
} 