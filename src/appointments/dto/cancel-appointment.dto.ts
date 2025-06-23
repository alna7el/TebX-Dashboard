import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CancelAppointmentDto {

  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  reason: string;
}