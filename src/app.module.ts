import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';


import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';
import { KeycloakModule } from './keycloak/keycloak.module';
import { SeederModule } from './seeds/seeder.module';
import { ClinicsModule } from './clinics/clinic.module';
import { CountriesModule } from './countries/country.module';
import { CitiesModule } from './cities/city.module';
import { ProviderBranchModule } from './branches/branch.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { RolesModule } from './roles/roles.module';
import { PatientModule } from './patients/patient.module';
import { SpecialityModule } from './speciality/speciality.module';
import { MailModule } from './mailer/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { LookupModule } from './lookups/lookup.module';
import { ServiceModule } from './services/service.module';
import { AppointmentModule } from './appointments/appointment.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { TransactionModule } from './transactions/transactions.module';
import { PrescriptionModule } from './prescriptions/prescription.module';
import { PractitionarModule } from './practitionar/practitionar.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DoctorModule } from './doctors/doctor.module';
import { DistrictModule } from './districts/schema/district.module';
import { DoctorAttendanceModule } from './doctor_attendance/doctor-attendance.module';
import { ClinicUserWorkingHoursModule } from './clinic_user_working_hours/clinic-user-working-hours.module';
import { DashboardModule } from './dashboard/dashboard.module';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  KeycloakConnectModule.registerAsync({
    useFactory: (ConfigService: ConfigService) => ({
      authServerUrl: ConfigService.get<string>('KEYCLOAK_URL'),
      realm: ConfigService.get<string>('KEYCLOAK_REALM'),
      clientId: ConfigService.get<string>('KEYCLOAK_CLIENT_ID'),
      secret: ConfigService.get<string>('KEYCLOAK_CLIENT_PASSWORD'),
    }),
    inject: [ConfigService]
  }),
  MongooseModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
      uri: configService.get<string>('DATABASE_URL'),
    }),
    inject: [ConfigService],
  }),
  MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      transport: {
        host: configService.get<string>('MAIL_HOST'),
        port: configService.get('MAIL_PORT'),
        auth: {
          user: configService.get('MAIL_USERNAME'),
          pass: configService.get('MAIL_PASSWORD'),
        },

      },
      template: {
        dir: './src/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  }),
  ScheduleModule.forRoot(),


    UsersModule,
    KeycloakModule,
    SeederModule,
    ClinicsModule,
    CountriesModule,
    CitiesModule,
    ProviderBranchModule,
    FileUploadModule,
    RolesModule,
    PatientModule,
    SpecialityModule,
    MailModule,
    LookupModule,
    ServiceModule,
    AppointmentModule,
    DiagnosisModule,
    TransactionModule,
    PrescriptionModule,
    PractitionarModule,
    StatisticsModule,
    DoctorModule,
    DistrictModule,
    DoctorAttendanceModule,
    ClinicUserWorkingHoursModule,
    DashboardModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    }
  ]
})
export class AppModule { }
