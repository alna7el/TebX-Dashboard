import { Module } from "@nestjs/common";
import { DiagnosisController } from "./diagnosis.controller";
import { DiagnosisService } from "./diagnosis.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Diagnosis, DiagnosisSchema } from "./schema/diagnosis.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Diagnosis.name, schema: DiagnosisSchema }])],
  controllers: [DiagnosisController],
  providers: [DiagnosisService]
})
export class DiagnosisModule { }