import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Patient } from "./patients.schema";

export type CountryDocument = HydratedDocument<VitalSign>;

@Schema({ timestamps: true })
export class VitalSign {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient
  @Prop({ required: true })
  date: Date;
  @Prop({ required: true })
  time: string;
  @Prop({ required: true })
  height: number;
  @Prop({ required: true })
  weight: number;
  @Prop({ required: true })
  systolic_pressure: number;
  @Prop({ required: true })
  diastolic_pressure: number;
  @Prop({ required: true })
  heart_rate: number;
  @Prop({ required: true })
  respiratory_rate: number;
  @Prop({ required: true })
  temperature: number;
  @Prop({ required: true })
  oxygen_saturation: number;
  @Prop({ required: false, default: null })
  notes: string;
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, 'ref': 'User' })
  collected_by: string;
}

export const VitalSignSchema = SchemaFactory.createForClass(VitalSign).set('versionKey', false);