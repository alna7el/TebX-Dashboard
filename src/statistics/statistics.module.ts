import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Appointment, AppointmentSchema } from "src/appointments/schema/appointments.schema";
import { Patient, PatientSchema } from "src/patients/schema/patients.schema";

@Module({
  imports: [MongooseModule.forFeature([
    { schema: AppointmentSchema, name: Appointment.name },
    { schema: PatientSchema, name: Patient.name }
  ])],
  providers: [StatisticsService],
  controllers: [StatisticsController]
})
export class StatisticsModule { }