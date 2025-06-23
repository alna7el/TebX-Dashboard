import { Module } from "@nestjs/common";
import { DistrictController } from "../district.controller";
import { DistrictService } from "../district.service";
import { MongooseModule } from "@nestjs/mongoose";
import { District, DistrictSchema } from "./district.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])],

  controllers: [DistrictController],
  providers: [DistrictService]
})
export class DistrictModule { }