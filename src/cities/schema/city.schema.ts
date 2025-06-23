import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class City {
  @Prop({ required: true })
  name: string;
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  country: Types.ObjectId;

}

export const CitySchema = SchemaFactory.createForClass(City).set('versionKey', false);