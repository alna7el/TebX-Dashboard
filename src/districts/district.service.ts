import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { District } from "./schema/district.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class DistrictService {
  constructor(@InjectModel(District.name) private readonly districtModel: Model<District>) { }

  async findByCity(city: string) {
    const cityId = new Types.ObjectId(city);
    return this.districtModel.find({ city: cityId }).exec();
  }
}
