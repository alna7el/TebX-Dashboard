import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileUpload, FileUploadSchema } from './schema/file-upload.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileUpload.name, schema: FileUploadSchema }])],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService]
})
export class FileUploadModule { }
