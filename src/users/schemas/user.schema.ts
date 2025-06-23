import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ProviderBranch } from 'src/branches/schema/branch.schema';
import { Clinic } from 'src/clinics/schemas/clinic.schema';
import { Role } from 'src/roles/schemas/role.schema';
import { Speciality } from 'src/speciality/schema/speciality.schema';

export type userDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  firstName: string;

  @Prop()
  firstNameAR: string;

  @Prop()
  lastName: string;

  @Prop()
  lastNameAR: string;

  @Prop()
  phone: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true })
  role_id: Role;

  @Prop()
  gender: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  status: string;

  @Prop()
  birthDate: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }])
  clinics: Clinic[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', default: null })
  speciality: Speciality;

  @Prop({ type: Date, default: null })
  last_active: Date

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  added_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  added_by_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  modified_by: mongoose.Types.ObjectId;

  @Prop({ default: null })
  modified_at: Date;

  @Prop({ default: null })
  keycloak_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ProviderBranch', default: null })
  branch: ProviderBranch;
}

export const UserSchema = SchemaFactory.createForClass(User).set('versionKey', false);

