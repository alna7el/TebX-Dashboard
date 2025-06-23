import { ApiProperty } from '@nestjs/swagger';

export class AppointmentSummaryDto {
  @ApiProperty({ description: 'Total appointments for today' })
  total: number;

  @ApiProperty({ description: 'Completed appointments' })
  completed: number;

  @ApiProperty({ description: 'In-progress appointments' })
  inProgress: number;

  @ApiProperty({ description: 'Booked/waiting appointments' })
  booked: number;

  @ApiProperty({ description: 'Cancelled appointments' })
  cancelled: number;

  @ApiProperty({ description: 'No-show appointments' })
  noShow: number;
}

export class PatientFlowDto {
  @ApiProperty({ description: 'Patients currently waiting' })
  waiting: number;

  @ApiProperty({ description: 'Patients with doctors' })
  withDoctor: number;

  @ApiProperty({ description: 'Patients who have arrived today' })
  arrivedToday: number;

  @ApiProperty({ description: 'Average wait time in minutes' })
  avgWaitTime: number;
}

export class DoctorStatusDto {
  @ApiProperty({ description: 'Doctor ID' })
  doctorId: string;

  @ApiProperty({ description: 'Doctor name' })
  doctorName: string;

  @ApiProperty({ description: 'Doctor speciality' })
  speciality: string;

  @ApiProperty({ description: 'Current patient count' })
  currentPatients: number;

  @ApiProperty({ description: 'Total appointments today' })
  todayAppointments: number;

  @ApiProperty({ description: 'Is doctor currently available' })
  isAvailable: boolean;

  @ApiProperty({ description: 'Next available slot time' })
  nextAvailableSlot?: string;
}

export class ClinicOverviewDto {
  @ApiProperty({ description: 'Clinic ID' })
  clinicId: string;

  @ApiProperty({ description: 'Clinic name' })
  clinicName: string;

  @ApiProperty({ description: 'Current date for the overview' })
  date: string;

  @ApiProperty({ description: 'Appointment summary for today' })
  appointmentSummary: AppointmentSummaryDto;

  @ApiProperty({ description: 'Real-time patient flow metrics' })
  patientFlow: PatientFlowDto;

  @ApiProperty({ description: 'Status of all doctors in the clinic', type: [DoctorStatusDto] })
  doctorStatus: DoctorStatusDto[];

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;
}
