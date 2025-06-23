import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { City } from './schema/city.schema';
@Injectable()
export class CityService {
  constructor(@InjectModel(City.name) private readonly cityModel: Model<City>) { }

  async findByCountry(country: string) {
    console.log(country);
    return this.cityModel.find({ country: new Types.ObjectId(country) }).exec();
  }
}