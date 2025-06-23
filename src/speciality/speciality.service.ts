import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speciality } from './schema/speciality.schema';
@Injectable()
export class SpecialityService {
  constructor(@InjectModel(Speciality.name) private readonly SpecialityModel: Model<Speciality>) { }

  async findAll() {
    return this.SpecialityModel.find().exec();
  }

  async findOne(id: string): Promise<Speciality> {
    return this.SpecialityModel.findOne({ _id: id }).exec();
  }

}