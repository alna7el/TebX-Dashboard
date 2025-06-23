import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from 'src/services/schema/service.schema';

@Injectable()
export class ServiceSeeder {
  constructor(@InjectModel(Service.name) private readonly serviceModel: Model<Service>) { }

  async seed() {
    const services = [
      { name_ar: 'فيتامينات', name_en: 'Multivitamins', price: 200 },
      { name_ar: 'تقوية المناعة', name_en: 'Immunity boost', price: 200 },
      { name_ar: 'الاشعة السينية', name_en: 'X-ray', price: 200 },
      { name_ar: 'علاج العظام', name_en: 'Osteotherapy', price: 200 },
      { name_ar: 'علاج طبيعى', name_en: 'Injury therapy', price: 200 }
    ];

    for (const service of services) {
      const existingService = await this.serviceModel.findOne({ name_en: service.name_en });
      if (!existingService) {
        await this.serviceModel.create(service);
      }
    }
  }
}