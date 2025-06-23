import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsRequiredIfNotSpecialAppointment } from "src/common/validators/is-required-if-not-waiting-list.decorator";
import { IsTimeFormat } from "src/common/validators/is-time-format.decorator";

export enum AppointmentType {
  EXAMINATION = 'examination',
  FOLLOW_UP = 'follow up',
}
export class AppointmentDto {
  @IsRequiredIfNotSpecialAppointment()
  readonly date: string;

  @IsRequiredIfNotSpecialAppointment()
  @IsTimeFormat()
  readonly time: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly patient: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly doctor: string;

  @IsNotEmpty()
  @IsMongoId()
  readonly clinic: string;

  @IsOptional()
  @IsMongoId()
  readonly service: string;

  @IsOptional()
  @IsString()
  readonly notes: string

  @IsNotEmpty()
  @IsString()
  @IsEnum(AppointmentType, {
    message: 'appointment_type must be either examination or follow up',
  })
  readonly appointment_type: string

  @IsBoolean()
  is_waiting_list: boolean

  @IsBoolean()
  is_emergency: boolean

} 