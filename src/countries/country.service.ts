import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country } from './schema/countries.schema';
@Injectable()
export class CountryService {
  constructor(@InjectModel(Country.name) private readonly countryModel: Model<Country>) { }

  async findAll() {
    return this.countryModel.aggregate([
      {
        $addFields: {
          isSaudiArabia: {
            $cond: [{ $eq: ["$name", "Saudi Arabia"] }, 1, 0],
          },
        },
      },
      { $sort: { isSaudiArabia: -1 } },
      { $project: { isSaudiArabia: 0 } }
    ]).exec();
  }

  async findOne(id: string): Promise<Country> {
    return this.countryModel.findOne({ _id: id }).exec();
  }

}