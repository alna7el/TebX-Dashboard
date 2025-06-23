import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class QueuePatientDto {
  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Patient name in Arabic' })
  patientNameAr: string;

  @ApiProperty({ description: 'Patient name in English' })
  patientNameEn: string;

  @ApiProperty({ description: 'Medical file number' })
  medicalFileNumber: string;

  @ApiProperty({ description: 'Appointment ID' })
  appointmentId: string;

  @ApiProperty({ description: 'Scheduled appointment time' })
  scheduledTime: string;

  @ApiProperty({ description: 'Patient arrival time' })
  arrivalTime: Date;

  @ApiProperty({ description: 'Current queue position' })
  queuePosition: number;

  @ApiProperty({ description: 'Estimated wait time in minutes' })
  estimatedWaitTime: number;

  @ApiProperty({ description: 'Appointment status' })
  status: string;

  @ApiProperty({ description: 'Doctor name' })
  doctorName?: string;

  @ApiProperty({ description: 'Service name' })
  serviceName: string;
}

export class WaitingRoomDto {
  @ApiProperty({ description: 'Clinic ID' })
  clinicId: string;

  @ApiProperty({ description: 'Total patients in queue' })
  totalInQueue: number;

  @ApiProperty({ description: 'Patients currently being served' })
  currentlyServed: number;

  @ApiProperty({ description: 'Average wait time in minutes' })
  averageWaitTime: number;

  @ApiProperty({ description: 'Queue of waiting patients', type: [QueuePatientDto] })
  queue: QueuePatientDto[];

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}

export class CheckInDto {
  @ApiProperty({ description: 'Patient ID to check in' })
  @IsMongoId()
  patientId: string;

  @ApiProperty({ description: 'Appointment ID' })
  @IsMongoId()
  appointmentId: string;

  @ApiProperty({ description: 'Optional notes for check-in' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueueAnalyticsDto {
  @ApiProperty({ description: 'Clinic ID' })
  clinicId: string;

  @ApiProperty({ description: 'Date for analytics' })
  date: string;

  @ApiProperty({ description: 'Peak queue time' })
  peakQueueTime: string;

  @ApiProperty({ description: 'Maximum queue length today' })
  maxQueueLength: number;

  @ApiProperty({ description: 'Average service time in minutes' })
  averageServiceTime: number;

  @ApiProperty({ description: 'Total patients served today' })
  totalPatientsServed: number;

  @ApiProperty({ description: 'Hourly queue length data' })
  hourlyQueueData: { hour: number; queueLength: number; avgWaitTime: number }[];
}
