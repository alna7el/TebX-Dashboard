import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicUserWorkingHoursController } from './clinic-user-working-hours.controller';
import { ClinicUserWorkingHoursService } from './clinic-user-working-hours.service';
import { ClinicUserWorkingHour, ClinicUserWorkingHourSchema } from './schema/clinic-user-working-hours.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AppointmentModule } from 'src/appointments/appointment.module';
import { ClinicsModule } from 'src/clinics/clinic.module';
import { DoctorAttendanceModule } from 'src/doctor_attendance/doctor-attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClinicUserWorkingHour.name, schema: ClinicUserWorkingHourSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AppointmentModule,
    UsersModule,
    ClinicsModule,
    DoctorAttendanceModule,
  ],
  controllers: [ClinicUserWorkingHoursController],
  providers: [ClinicUserWorkingHoursService],
  exports: [ClinicUserWorkingHoursService],
})
export class ClinicUserWorkingHoursModule { } 