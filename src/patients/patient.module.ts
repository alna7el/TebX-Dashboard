import { Module } from "@nestjs/common";
import { PatientService } from "./patient.service";
import { PatientController } from "./patient.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Patient, PatientSchema } from "./schema/patients.schema";
import { UsersModule } from "src/users/users.module";
import { VitalSign, VitalSignSchema } from "./schema/vital-signs.schema";
import { Diagnosis, DiagnosisSchema } from "src/diagnosis/schema/diagnosis.schema";
import { Appointment, AppointmentSchema } from "src/appointments/schema/appointments.schema";
import { Prescription, PrescriptionSchema } from "src/prescriptions/schema/prescription.schema";
import { Counter, CounterSchema } from "src/counters/counters.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema },
  { name: Patient.name, schema: PatientSchema },
  { name: VitalSign.name, schema: VitalSignSchema },
  { name: Prescription.name, schema: PrescriptionSchema },
  { name: Diagnosis.name, schema: DiagnosisSchema },
  { name: Appointment.name, schema: AppointmentSchema },
  { name: Counter.name, schema: CounterSchema }
  ]), UsersModule],
  providers: [PatientService],
  controllers: [PatientController]
})
export class PatientModule { }