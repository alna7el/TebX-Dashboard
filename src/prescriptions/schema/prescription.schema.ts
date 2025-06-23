import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Appointment } from "src/appointments/schema/appointments.schema";
import { Clinic } from "src/clinics/schemas/clinic.schema";
import { Patient } from "src/patients/schema/patients.schema";
import { User } from "src/users/schemas/user.schema";

export type CountryDocument = HydratedDocument<Prescription>;

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true })
  appointment: Appointment


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true })
  clinic: Clinic

  @Prop([{
    medication_name: { type: String, required: true },
    dose: { type: Number, required: true },
    dose_unit: { type: String, required: true },
    frequency: { type: Number, required: true },
    frequency_unit: { type: String, required: true },
  }])
  medications: Array<{
    medication_name: string;
    dose: number;
    dose_unit: string;
    frequency: number;
    frequency_unit: string;
  }>;

  @Prop({ required: false })
  instructions: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  added_by: User

  @Prop({ unique: true })
  number: string;

}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription).set('versionKey', false);