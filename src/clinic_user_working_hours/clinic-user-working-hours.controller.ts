import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ClinicUserWorkingHoursService } from './clinic-user-working-hours.service';
import { CreateClinicUserWorkingHoursDto } from './dto/create-clinic-user-working-hours.dto';

@Controller('clinic-user-working-hours')
export class ClinicUserWorkingHoursController {
  constructor(private readonly clinicUserWorkingHoursService: ClinicUserWorkingHoursService) { }

  @Post()
  create(@Body() createClinicUserWorkingHoursDto: CreateClinicUserWorkingHoursDto) {
    return this.clinicUserWorkingHoursService.create(createClinicUserWorkingHoursDto);
  }

  @Get('available-slots/:doctorId/:clinicId')
  getAvailableTimeSlots(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string,
    @Query('date') date: string,
  ) {
    return this.clinicUserWorkingHoursService.getAvailableTimeSlots(
      doctorId,
      clinicId,
      date,
    );
  }

  @Get('availability/:doctorId/:clinicId')
  getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string,
    @Query('daysAhead') daysAhead: string
  ) {
    const daysAheadNumber = parseInt(daysAhead, 10);

    if (isNaN(daysAheadNumber) || daysAheadNumber <= 0) {
      throw new Error('daysAhead must be a positive number');
    }

    return this.clinicUserWorkingHoursService.getUserAvailability(
      doctorId,
      clinicId,
      daysAheadNumber
    );
  }
} 