import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Provider {

  @Prop({ required: true })
  name_ar: string;

  @Prop({ required: true })
  name_en: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  phone: string;
}

export const ProviderSchema = SchemaFactory.createForClass(Provider).set('versionKey', false);