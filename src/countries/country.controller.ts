import { Controller, Get } from '@nestjs/common';
import { CountryService } from './country.service';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) { }

  @Unprotected()
  @Get()
  async findAll() {
    const countries = await this.countryService.findAll();
    return {
      countries
    }
  }


}