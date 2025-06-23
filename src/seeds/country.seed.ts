import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Country as CountryModel } from 'src/countries/schema/countries.schema';
import { City as CityModel } from 'src/cities/schema/city.schema';
import { State, Country } from 'country-state-city';

@Injectable()
export class CountrySeeder {
  constructor(@InjectModel(CountryModel.name) private countryModel: Model<CountryModel>,
    @InjectModel(CityModel.name) private cityModel: Model<CityModel>

  ) { }
  async seed() {
    const countries = Country.getAllCountries();
    for (const countryObject of countries) {
      let existingCountry = await this.countryModel.findOne({ name: countryObject.name });
      if (!existingCountry) {
        existingCountry = await this.countryModel.create(countryObject);
      }
      const cities = State.getStatesOfCountry(countryObject.isoCode);
      if (cities) {
        for (const cityObject of cities) {
          const existingCity = await this.cityModel.findOne({
            name: cityObject.name,
            country: existingCountry._id,
          });
          if (!existingCity) {
            await this.cityModel.create({
              name: cityObject.name,
              country: existingCountry._id,
            });
          }
        }
      }
    }
  }
}