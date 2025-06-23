import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { SeederService } from './seeder.service';
import { RoleSeeder } from './role.seed';
import { Clinic, ClinicSchema } from 'src/clinics/schemas/clinic.schema';
import { ClinicSeeder } from './clinic.seed';
import { CountrySeeder } from './country.seed';
import { Country, CountrySchema } from 'src/countries/schema/countries.schema';
import { City, CitySchema } from 'src/cities/schema/city.schema';
import { Speciality, SpecialitySchema } from 'src/speciality/schema/speciality.schema';
import { SpecialitySeeder } from './speciality.seed';
import { Service, ServiceSchema } from 'src/services/schema/service.schema';
import { ServiceSeeder } from './service.seed';
import { Icd, IcdSchema } from 'src/icd10/schema/icd.schema';
import { IcdSeeder } from './icd.seed';
import { District, DistrictSchema } from 'src/districts/schema/district.schema';
import { DistrictSeeder } from './district.seed';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Clinic.name, schema: ClinicSchema },
      { name: Country.name, schema: CountrySchema },
      { name: City.name, schema: CitySchema },
      { name: Speciality.name, schema: SpecialitySchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Icd.name, schema: IcdSchema },
      { name: District.name, schema: DistrictSchema }


    ]),
  ],
  providers: [SeederService, RoleSeeder, ClinicSeeder,
    CountrySeeder,
    SpecialitySeeder,
    ServiceSeeder,
    IcdSeeder,
    DistrictSeeder
  ],
  exports: [SeederService],
})
export class SeederModule { }
