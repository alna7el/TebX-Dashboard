import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProviderBranch } from 'src/branches/schema/branch.schema';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { Patient } from 'src/patients/schema/patients.schema';
import { Service } from 'src/services/schema/service.schema';
import { User } from 'src/users/schemas/user.schema';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: function (this: Appointment) { return !this.is_waiting_list && !this.is_emergency; } })
  date: Date;

  @Prop({ required: function (this: Appointment) { return !this.is_waiting_list && !this.is_emergency; } })
  time: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true })
  service: Service

  @Prop({ default: 'Booked', enum: ['Completed', 'Booked', 'In-progress', 'Cancelled', 'No-show'] })
  status: string;

  @Prop({
    type: String,
    enum: ['patient_check_in', 'take_vital_signs', 'doctor_examine_vitals', null],
    default: null,
  })
  in_progress_stage: 'arrived' | 'take_vital_signs' | 'doctor_examine_vitals' | null;

  @Prop({ required: true })
  appointment_type: string;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  notes: string;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  reason: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true })
  patient: Patient

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true })
  clinic: Clinic

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "ProviderBranch", required: true })
  branch: ProviderBranch

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  visit_summary: string;

  @Prop({ default: null })
  visit_summary_date: Date;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  complaint: string;

  @Prop({ default: null })
  complaint_date: Date;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  treatment_plan: string;

  @Prop({ default: null })
  treatment_plan_date: Date;

  @Prop({ type: mongoose.Schema.Types.String, default: null })
  medical_record: string;

  @Prop({ default: null })
  medical_record_date: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null })
  doctor: User

  @Prop({ default: null, required: false })
  patient_arrival_time: Date;

  @Prop({ type: Boolean, default: false })
  is_waiting_list: boolean;

  @Prop({ type: Boolean, default: false })
  is_emergency: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment).set('versionKey', false);
