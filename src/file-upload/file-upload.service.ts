import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileUpload } from './schema/file-upload.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient } from '@azure/storage-blob';
import * as stream from 'stream';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class FileUploadService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  constructor(private readonly configService: ConfigService,
    @InjectModel(FileUpload.name) private fileUpload: Model<FileUpload>
  ) {
    const AZURE_STORAGE_CONNECTION_STRING = this.configService.get('AZURE_STORAGE_CONNECTION_STRING');
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('Azure Storage Connection string is not defined in environment variables');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    this.containerName = 'uploads';
    this.createContainerIfNotExists();
  }
  async saveFile(file: Express.Multer.File) {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobName = `${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    try {
      await blockBlobClient.uploadStream(bufferStream, file.size, 5, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });
      const mongoFile = await this.fileUpload.create({ "path": blockBlobClient.url })
      return mongoFile;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async createContainerIfNotExists() {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);

    try {
      const createContainerResponse = await containerClient.createIfNotExists();
      if (createContainerResponse.succeeded) {
        console.log(`Container "${this.containerName}" created successfully.`);
      } else {
        console.log(`Container "${this.containerName}" already exists.`);
      }
    } catch (error) {
      console.error('Error creating container:', error.message);
      throw new InternalServerErrorException('Could not create or access container');
    }
  }



}

