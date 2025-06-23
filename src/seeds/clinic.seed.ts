// seeds/clinic.seed.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Clinic } from 'src/clinics/schemas/clinic.schema';

@Injectable()
export class ClinicSeeder {
  constructor(@InjectModel(Clinic.name) private clinicModel: Model<Clinic>) { }

  async seed() {
  }
}
