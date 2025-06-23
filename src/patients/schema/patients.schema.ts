import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Country } from "src/countries/schema/countries.schema";

export type CountryDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true })
  first_name_ar: string;
  @Prop({ required: false, default: null })
  second_name_ar: string;
  @Prop({ required: false, default: null })
  third_name_ar: string;
  @Prop({ required: true })
  last_name_ar: string;
  @Prop({ required: true })
  first_name_en: string;
  @Prop({ required: false, default: null })
  second_name_en: string;
  @Prop({ required: false, default: null })
  third_name_en: string;
  @Prop({ required: true })
  last_name_en: string;
  @Prop({ required: true })
  phone: string;
  @Prop({ default: null })
  secondary_phone: string;
  @Prop({ default: null })
  email: string;
  @Prop({ required: true })
  date_of_birth: Date;
  @Prop({ default: null })
  address: string
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: false })
  country_id: Country
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'City', required: false })
  city_id: Country
  @Prop({ required: true })
  national_id_type: string;
  @Prop({ required: true })
  national_id: string;
  @Prop({ required: true })
  national_id_expiry: string;
  @Prop({ default: null })
  gender: string;
  @Prop({ default: null })
  nationality: string;
  @Prop({ default: null })
  marital_status: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  added_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  added_by_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modified_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  modified_at: Date;

  @Prop({ default: null })
  medical_file_number: string


}

export const PatientSchema = SchemaFactory.createForClass(Patient).set('versionKey', false);
PatientSchema.virtual('vital-signs', {
  ref: 'VitalSign',
  localField: '_id',
  foreignField: 'patient'
});
PatientSchema.virtual('prescription', {
  ref: 'Prescription',
  localField: '_id',
  foreignField: 'patient'
});
PatientSchema.virtual('diagnosis', {
  ref: 'Diagnosis',
  localField: '_id',
  foreignField: 'patient'
});


PatientSchema.set('toObject', { virtuals: true });
PatientSchema.set('toJSON', { virtuals: true });
