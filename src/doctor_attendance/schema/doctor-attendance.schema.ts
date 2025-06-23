import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { User } from 'src/users/schemas/user.schema';

export type DoctorAttendanceDocument = HydratedDocument<DoctorAttendance>;

@Schema({ timestamps: true })
export class DoctorAttendance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  doctor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true })
  clinic: Clinic;

  @Prop({ required: true })
  date: Date;
}

export const DoctorAttendanceSchema = SchemaFactory.createForClass(DoctorAttendance).set('versionKey', false);
