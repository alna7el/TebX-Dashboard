// seed/seeder.service.ts
import { Injectable } from '@nestjs/common';
import { RoleSeeder } from './role.seed';
import { ClinicSeeder } from './clinic.seed';
import { CountrySeeder } from './country.seed';
import { SpecialitySeeder } from './speciality.seed';
import { ServiceSeeder } from './service.seed';
import { IcdSeeder } from './icd.seed';
import { DistrictSeeder } from './district.seed';

@Injectable()
export class SeederService {
  constructor(
    private readonly roleSeeder: RoleSeeder,
    private readonly clinicSeeder: ClinicSeeder,
    private readonly countrySeeder: CountrySeeder,
    private readonly specialitySeeder: SpecialitySeeder,
    private readonly serviceSeeder: ServiceSeeder,
    private readonly icdSeeder: IcdSeeder,
    private readonly districtSeeder: DistrictSeeder
  ) { }

  async seed() {
    // await this.roleSeeder.createRoles();
    // await this.countrySeeder.seed();
    // await this.specialitySeeder.seed();
    // await this.serviceSeeder.seed();
    // await this.icdSeeder.seed();
    await this.districtSeeder.seed();


  }
}
