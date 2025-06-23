import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class ProviderBranch {

  @Prop({ required: true })
  name_ar: string;
  @Prop({ required: true })
  name_en: string;
  @Prop({ unique: true })
  number: string;
  @Prop({ required: false })
  email: string;
  @Prop({ default: null })
  phone: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, default: null })
  district: string;
  @Prop({ required: false })
  address: string;
  @Prop({ default: 'active' })
  status: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  added_by: mongoose.Types.ObjectId;
  @Prop({ default: null })
  added_by_at: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modified_by: mongoose.Types.ObjectId;
  @Prop({ default: null })
  modified_at: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FileUpload', required: false })
  image: mongoose.Types.ObjectId
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Country' })
  country: mongoose.Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'City' })
  city: mongoose.Types.ObjectId;


}
export const ProviderBranchSchema = SchemaFactory.createForClass(ProviderBranch);


ProviderBranchSchema.virtual('clinics', {
  ref: 'Clinic',
  localField: '_id',
  foreignField: 'branch',
});
ProviderBranchSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'branch'
});

ProviderBranchSchema.set('toObject', { virtuals: true });
ProviderBranchSchema.set('toJSON', { virtuals: true });


