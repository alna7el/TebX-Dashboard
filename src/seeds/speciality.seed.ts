import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speciality } from 'src/speciality/schema/speciality.schema';

@Injectable()
export class SpecialitySeeder {
  constructor(@InjectModel(Speciality.name) private specialityModel: Model<Speciality>) { }

  async seed() {
    const specialities = [
      { name_en: 'Psychiatry Specialist (Medical treatment)', name_ar: 'تخصص الطب النفسي (علاج دوائي)' },
      { name_en: 'Dental Specialist and temporomandibular joint problems', name_ar: 'تخصص الأسنان و مشاكل المفصل الصدغي' },
      { name_en: 'Neurology Specialist', name_ar: 'تخصص الأعصاب' },
      { name_en: 'Pediatrics & Pediatric Neurology Specialist', name_ar: 'تخصص الطفل وأعصاب الأطفال' },


    ];

    for (const speciality of specialities) {
      const existingSpeciality = await this.specialityModel.findOne({ name_en: speciality.name_en });
      if (!existingSpeciality) {
        await this.specialityModel.create(speciality);
      }
    }
  }
}