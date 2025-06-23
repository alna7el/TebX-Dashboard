import { Controller, Get, Query } from "@nestjs/common";
import { PractitionarService } from "./practitionar.service";
import { AppointmentFiltersDto } from "./filters/appointments.filters.dto";
import { AuthenticatedUser } from "nest-keycloak-connect";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('practitionar')
@Controller('practitionar')
export class PractitionarController {
  constructor(
    private readonly practitionarService: PractitionarService
  ) { }

  @Get('appointments')
  @ApiBearerAuth('access_token')
  async getAppointments(@Query() appointmentFiltersDto: AppointmentFiltersDto,
    @AuthenticatedUser() user: any

  ) {
    return this.practitionarService.getAppointments(appointmentFiltersDto, user.email);
  }

}