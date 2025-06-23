import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicDocument = HydratedDocument<Icd>;

@Schema()
export class Icd {
  @Prop({ required: true })
  code: string;
  @Prop({ required: true })
  description: string;

}

export const IcdSchema = SchemaFactory.createForClass(Icd).set('versionKey', false);
