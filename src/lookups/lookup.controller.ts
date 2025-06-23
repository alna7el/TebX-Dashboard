import { Controller, Get, Query } from "@nestjs/common";
import { LookupService } from "./lookup.service";

@Controller('lookups')
export class LookupController {
  constructor(private readonly lookupService: LookupService) { }
  @Get('/users')
  async getUsers(@Query('role_id') role_id?: string) {
    const users = await this.lookupService.getUsers(role_id);
    return { users };
  }
  @Get('/branches')
  async getBranches(@Query('userId') userId: string) {
    const branches = await this.lookupService.getBranches(userId);
    return { branches };
  }
  @Get('/doctors')
  async getDoctors(@Query('clinicIds') clinicIds?: string) {
    const clinicIdsArray = clinicIds ? clinicIds.split(',') : undefined;
    const doctors = await this.lookupService.getDoctors(clinicIdsArray);
    return { doctors };
  }
  @Get('/services')
  async getServices() {
    const services = await this.lookupService.getServices();
    return { services };
  }
  @Get('/clinics')
  async getClinics(@Query('branch') branch?: string) {
    const services = await this.lookupService.getClinics(branch);
    return { services };
  }
  @Get('/patients')
  async getPatients(@Query('keyword') keyword: string) {
    const patients = await this.lookupService.getPatients(keyword);
    return { patients };
  }
  @Get('/icds')
  async getIcds(@Query('keyword') keyword?: string) {
    const icds = await this.lookupService.getIcds(keyword);
    return { icds };
  }

}