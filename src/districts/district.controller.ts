import { Controller, Get, Param } from "@nestjs/common";
import { DistrictService } from "./district.service";
import { Unprotected } from "nest-keycloak-connect";

@Controller('districts')
export class DistrictController {
  constructor(private readonly districtService: DistrictService) { }

  @Unprotected()
  @Get('/:city')
  async findByCity(@Param('city') city: string) {
    const districts = await this.districtService.findByCity(city);
    return {
      districts
    }
  }
}

