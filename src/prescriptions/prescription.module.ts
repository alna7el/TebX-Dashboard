import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Prescription, PrescriptionSchema } from "./schema/prescription.schema";
import { PrescriptionController } from "./prescription.controller";
import { PrescriptionService } from "./prescription.service";
import { RolesModule } from "src/roles/roles.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: PrescriptionSchema, name: Prescription.name },
    ]),
    RolesModule,
    UsersModule
  ],
  controllers: [PrescriptionController],
  providers: [PrescriptionService]
})
export class PrescriptionModule { }