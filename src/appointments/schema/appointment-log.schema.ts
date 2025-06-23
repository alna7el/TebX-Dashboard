import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppointmentLogDocument = HydratedDocument<AppointmentLog>;

@Schema({ timestamps: true })
export class AppointmentLog {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  affectedCount: number;

  @Prop({ type: [Types.ObjectId], required: true })
  appointmentIds: Types.ObjectId[];

  @Prop({ type: Object, required: false })
  metadata: Record<string, any>;
}

export const AppointmentLogSchema = SchemaFactory.createForClass(AppointmentLog).set('versionKey', false); 