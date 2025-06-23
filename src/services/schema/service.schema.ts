import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ClinicDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true })
  name_ar: string;

  @Prop({ required: true })
  name_en: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  sbs_code: string;

  @Prop({ required: false })
  hyphenated_sbs_code: string

  @Prop({ required: false })
  reference_code: string

  @Prop({ required: false, default: null })
  description_ar: string;

  @Prop({ required: false, default: null })
  description_en: string;

  @Prop({ required: false, default: "active" })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  added_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  added_by_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modified_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  modified_at: Date;


}

export const ServiceSchema = SchemaFactory.createForClass(Service).set('versionKey', false);


