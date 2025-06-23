import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Clinic, ClinicSchema } from './schemas/clinic.schema';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';
import { UsersModule } from 'src/users/users.module';
import { AppointmentModule } from 'src/appointments/appointment.module';
import { Counter, CounterSchema } from 'src/counters/counters.schema';
@Module({
  imports: [
    forwardRef(() => AppointmentModule),
    MongooseModule.forFeature([{ name: Clinic.name, schema: ClinicSchema },
    { name: Counter.name, schema: CounterSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService]
})
export class ClinicsModule { }