import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { User } from 'src/users/schemas/user.schema';

export type ClinicUserWorkingHourDocument = HydratedDocument<ClinicUserWorkingHour>;

@Schema({ timestamps: true })
export class ClinicUserWorkingHour {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User, default: null })
  doctor_id: string
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Clinic, default: null })
  clinic_id: string
  @Prop({
    type: [
      {
        day: { type: String, required: true },
        slots: [
          {
            start_time: { type: String, required: true },
            end_time: { type: String, required: true },
          },
        ],
      },
    ],
    default: [],
  })
  work_schedule: {
    day: string;
    slots: { start_time: string; end_time: string }[];
  }[];

}

export const ClinicUserWorkingHourSchema = SchemaFactory.createForClass(ClinicUserWorkingHour).set('versionKey', false);

