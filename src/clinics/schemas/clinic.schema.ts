import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProviderBranch } from 'src/branches/schema/branch.schema';
import { User } from 'src/users/schemas/user.schema';

export type ClinicDocument = HydratedDocument<Clinic>;

@Schema({ timestamps: true })
export class Clinic {
  @Prop({ required: true })
  name_ar: string;

  @Prop({ required: true })
  name_en: string;

  @IsOptional()
  @Prop({ default: null })
  email: string;

  @Prop({ unique: true })
  number: string;

  @IsOptional()
  @Prop({ default: null })
  address: string;

  @IsOptional()
  @Prop({ default: null })
  phone: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "ProviderBranch", required: true })
  branch: ProviderBranch;

  @Prop({ default: null, ref: 'User', type: mongoose.Schema.Types.ObjectId })
  added_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  added_by_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modified_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  modified_at: Date;

  @IsOptional()
  @Prop({ default: 'active' })
  status: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  users: User[];

}

export const ClinicSchema = SchemaFactory.createForClass(Clinic).set('versionKey', false);

