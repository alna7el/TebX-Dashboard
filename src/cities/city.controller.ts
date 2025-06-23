import { Controller, Get, Param } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Unprotected()
  @Get('/:country')
  async findAll(@Param('country') country: string) {
    const cities = await this.cityService.findByCountry(country);
    return {
      cities
    }
  }


}