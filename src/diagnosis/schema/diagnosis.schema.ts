import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Icd } from "src/icd10/schema/icd.schema";
import { Patient } from "src/patients/schema/patients.schema";

export type DiagnosisDocument = HydratedDocument<Diagnosis>;

@Schema({ timestamps: true })
export class Diagnosis {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Icd', required: true })
  initial: Icd

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Icd', required: true }])
  secondary: Icd

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Icd', required: true }])
  differential: Icd

  @Prop({ required: false, default: null })
  notes: string
}

export const DiagnosisSchema = SchemaFactory.createForClass(Diagnosis).set('versionKey', false);