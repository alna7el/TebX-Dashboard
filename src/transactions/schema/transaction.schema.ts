import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ProviderBranch } from 'src/branches/schema/branch.schema';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { Patient } from 'src/patients/schema/patients.schema';
import { Service } from 'src/services/schema/service.schema';
@Schema({ timestamps: true })
export class Transaction {

  @Prop({ required: true, enum: ['payment', 'refund'] })
  type: string;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  net_total: number;

  @Prop({ required: true, default: 0.0 })
  discount: number;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  inv_number: string;

  @Prop({ required: true })
  number: string;


  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Patient' })
  patient: Patient;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'ProviderBranch' })
  branch: ProviderBranch;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' })
  clinic: Clinic;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }])
  services: Service[];

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);





