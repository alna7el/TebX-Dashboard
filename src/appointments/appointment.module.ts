import { forwardRef, Module } from "@nestjs/common";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Appointment, AppointmentSchema } from "./schema/appointments.schema";
import { VitalSign, VitalSignSchema } from "src/patients/schema/vital-signs.schema";
import { ClinicsModule } from "src/clinics/clinic.module";
import { Service, ServiceSchema } from "src/services/schema/service.schema";
import { TransactionModule } from "src/transactions/transactions.module";
import { Counter, CounterSchema } from "src/counters/counters.schema";
import { UsersModule } from "src/users/users.module";
import { DoctorAttendanceModule } from "src/doctor_attendance/doctor-attendance.module";
import { AppointmentSchedulerService } from "./appointment-schedule.service";
import { AppointmentLog, AppointmentLogSchema } from "./schema/appointment-log.schema";

@Module({
  imports: [
    forwardRef(() => ClinicsModule),
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: VitalSign.name, schema: VitalSignSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Counter.name, schema: CounterSchema },
      { name: AppointmentLog.name, schema: AppointmentLogSchema },
    ]),
    TransactionModule,
    forwardRef(() => UsersModule),
    DoctorAttendanceModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, AppointmentSchedulerService],
  exports: [AppointmentService]
})
export class AppointmentModule { }