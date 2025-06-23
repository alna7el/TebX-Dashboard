import { Controller, Get } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';
import { SpecialityService } from './speciality.service';

@Controller('specialities')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) { }

  @Unprotected()
  @Get()
  async findAll() {
    const specialities = await this.specialityService.findAll();
    return {
      specialities
    }
  }


}