import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CountryDocument = HydratedDocument<Country>;

@Schema()
export class Country {
  @Prop({ required: true })
  name: string;
  @Prop()
  isoCode: string;
}

export const CountrySchema = SchemaFactory.createForClass(Country).set('versionKey', false);