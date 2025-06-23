import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type userDocument = HydratedDocument<Role>;

@Schema()
export class Role {
  @Prop()
  id: string;

  @Prop()
  keycloak_id: string;

  @Prop()
  name: string;

}

export const RoleSchema = SchemaFactory.createForClass(Role).set('versionKey', false);;
