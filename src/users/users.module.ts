import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesModule } from 'src/roles/roles.module';
import { IsSpecialityRequiredConstraint } from './validators/is-speciality-required.validator';
import { Clinic, ClinicSchema } from 'src/clinics/schemas/clinic.schema';
import { AppointmentModule } from 'src/appointments/appointment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Clinic.name, schema: ClinicSchema }]),
    RolesModule,
    forwardRef(() => AppointmentModule)
  ],
  controllers: [UserController],
  providers: [UserService, IsSpecialityRequiredConstraint],
  exports: [UserService, IsSpecialityRequiredConstraint]
})
export class UsersModule { }