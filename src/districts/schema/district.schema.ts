import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class District {
  @Prop()
  name_ar: string;
  @Prop()
  name_en: string;
  @Prop({ type: Types.ObjectId, ref: 'City', required: true })
  city: Types.ObjectId;

}

export const DistrictSchema = SchemaFactory.createForClass(District).set('versionKey', false);