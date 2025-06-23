import { Module } from "@nestjs/common";
import { DoctorAttendanceController } from "./doctor-attendance.controller";
import { DoctorAttendanceService } from "./doctor-attendance.service";
import { MongooseModule } from "@nestjs/mongoose";
import { DoctorAttendance, DoctorAttendanceSchema } from "./schema/doctor-attendance.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DoctorAttendance.name, schema: DoctorAttendanceSchema }]),
  ],
  controllers: [DoctorAttendanceController],
  providers: [DoctorAttendanceService],
  exports: [DoctorAttendanceService]
})
export class DoctorAttendanceModule { }