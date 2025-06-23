import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FileUploadDocument = HydratedDocument<FileUpload>;

@Schema()
export class FileUpload {
  @Prop({ required: true })
  path: string;
}

export const FileUploadSchema = SchemaFactory.createForClass(FileUpload).set('versionKey', false);