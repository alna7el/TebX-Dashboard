import { Module } from "@nestjs/common";
import { LookupController } from "./lookup.controller";
import { LookupService } from "./lookup.service";
import { User, UserSchema } from "src/users/schemas/user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ProviderBranch, ProviderBranchSchema } from "src/branches/schema/branch.schema";
import { Service, ServiceSchema } from "src/services/schema/service.schema";
import { Clinic, ClinicSchema } from "src/clinics/schemas/clinic.schema";
import { Patient, PatientSchema } from "src/patients/schema/patients.schema";
import { Icd, IcdSchema } from "src/icd10/schema/icd.schema";
import { RoleSchema } from "src/roles/schemas/role.schema";
import { Role } from "src/roles/schemas/role.schema";
import { DoctorAttendanceModule } from "src/doctor_attendance/doctor-attendance.module";

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: ProviderBranch.name, schema: ProviderBranchSchema },
    { name: Service.name, schema: ServiceSchema },
    { name: Clinic.name, schema: ClinicSchema },
    { name: Patient.name, schema: PatientSchema },
    { name: Icd.name, schema: IcdSchema },
    { name: Role.name, schema: RoleSchema },
  ]), DoctorAttendanceModule],
  controllers: [LookupController],
  providers: [LookupService]
})
export class LookupModule {

}