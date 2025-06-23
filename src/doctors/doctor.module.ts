import { Module } from "@nestjs/common";
import { DoctorController } from "./doctors.controller";
import { DoctorService } from "./doctor.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Appointment, AppointmentSchema } from "src/appointments/schema/appointments.schema";
import { UsersModule } from "src/users/users.module";
import { Clinic, ClinicSchema } from "src/clinics/schemas/clinic.schema";
import { ProviderBranch, ProviderBranchSchema } from "src/branches/schema/branch.schema";
import { DoctorAttendanceModule } from "src/doctor_attendance/doctor-attendance.module";

@Module({
  imports: [MongooseModule.forFeature([
    { name: Appointment.name, schema: AppointmentSchema },
    { name: Clinic.name, schema: ClinicSchema },
    { name: ProviderBranch.name, schema: ProviderBranchSchema },
  ]),
    UsersModule,
    DoctorAttendanceModule
  ],
  controllers: [DoctorController],
  providers: [DoctorService]
})
export class DoctorModule {

}