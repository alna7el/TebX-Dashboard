import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Speciality {
  @Prop({ required: true })
  name_ar: string
  @Prop({ required: true })
  name_en: string

}
export const SpecialitySchema = SchemaFactory.createForClass(Speciality).set('versionKey', 'false')