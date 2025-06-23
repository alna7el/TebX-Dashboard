import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId, IsArray, IsEnum, IsBoolean } from 'class-validator';

export class EmergencyBookingDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ description: 'Clinic ID' })
  @IsMongoId()
  clinicId: string;

  @ApiProperty({ description: 'Branch ID' })
  @IsMongoId()
  branchId: string;

  @ApiProperty({ description: 'Service ID' })
  @IsMongoId()
  serviceId: string;

  @ApiProperty({ description: 'Preferred doctor ID (optional)' })
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @ApiProperty({ description: 'Emergency reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Emergency notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Priority level' })
  @IsEnum(['high', 'urgent', 'critical'])
  priority: 'high' | 'urgent' | 'critical';
}

export class BulkStatusUpdateDto {
  @ApiProperty({ description: 'Array of appointment IDs to update' })
  @IsArray()
  @IsMongoId({ each: true })
  appointmentIds: string[];

  @ApiProperty({ description: 'New status for all appointments' })
  @IsEnum(['Completed', 'Booked', 'In-progress', 'Cancelled', 'No-show'])
  status: string;

  @ApiProperty({ description: 'Optional notes for the status update' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Reason for bulk update' })
  @IsString()
  reason: string;
}

export class QuickPatientLookupDto {
  @ApiProperty({ description: 'Search term (name, phone, medical file number)' })
  @IsString()
  searchTerm: string;

  @ApiProperty({ description: 'Clinic ID to search within' })
  @IsMongoId()
  clinicId: string;

  @ApiProperty({ description: 'Limit number of results' })
  @IsOptional()
  limit?: number;
}

export class QuickPatientResultDto {
  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Patient full name in Arabic' })
  fullNameAr: string;

  @ApiProperty({ description: 'Patient full name in English' })
  fullNameEn: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Medical file number' })
  medicalFileNumber: string;

  @ApiProperty({ description: 'Last appointment date' })
  lastAppointmentDate?: Date;

  @ApiProperty({ description: 'Has active appointment today' })
  hasActiveAppointment: boolean;

  @ApiProperty({ description: 'Current appointment status if active' })
  currentAppointmentStatus?: string;
}

export class QuickActionResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data?: any;

  @ApiProperty({ description: 'Affected record IDs' })
  affectedIds?: string[];
}

export class OneClickOperationDto {
  @ApiProperty({ description: 'Operation type' })
  @IsEnum(['reschedule', 'cancel', 'mark-present', 'mark-no-show'])
  operation: 'reschedule' | 'cancel' | 'mark-present' | 'mark-no-show';

  @ApiProperty({ description: 'Appointment ID' })
  @IsMongoId()
  appointmentId: string;

  @ApiProperty({ description: 'New date for reschedule (required if operation is reschedule)' })
  @IsOptional()
  @IsString()
  newDate?: string;

  @ApiProperty({ description: 'New time for reschedule (required if operation is reschedule)' })
  @IsOptional()
  @IsString()
  newTime?: string;

  @ApiProperty({ description: 'Reason for the operation' })
  @IsOptional()
  @IsString()
  reason?: string;
}
