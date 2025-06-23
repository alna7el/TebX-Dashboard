import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Appointment, AppointmentSchema } from "src/appointments/schema/appointments.schema";
import { PractitionarController } from "./practitionar.controller";
import { PractitionarService } from "./practitionar.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [MongooseModule.forFeature([
    { name: Appointment.name, schema: AppointmentSchema },
  ]),
    UsersModule
  ],
  providers: [PractitionarService],
  controllers: [PractitionarController]
})
export class PractitionarModule { }