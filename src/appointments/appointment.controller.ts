import { Body, ConflictException, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { AppointmentDto } from "./dto/appointment.dto";
import { AppointmentService } from "./appointment.service";
import { PaginationDto } from "./dto/pagination.dto";
import { PaginationWithFiltersDto } from "./dto/dynamic-filter.dto";
import { StatusUpdateDto } from "./dto/status-update.dto";
import { AuthenticatedUser } from "nest-keycloak-connect";
import { CancelAppointmentDto } from "./dto/cancel-appointment.dto";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('appointments')
@Controller('/appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) { }

  @Post('/')
  @ApiBearerAuth('access_token')
  async create(@Body() appointmentDto: AppointmentDto) {
    const { clinic, date, time } = appointmentDto;

    const existing = await this.appointmentService.findOneByClinicDateTime(clinic, date, time);
    if (existing) {
      throw new ConflictException('Time slot already taken');
    }
    const appointment = await this.appointmentService.create(appointmentDto);
    return { appointment }
  }

  @Get('/')
  @ApiBearerAuth('access_token')
  async findAll(
    @Query() PaginationDto: PaginationDto,
    @AuthenticatedUser() user
  ) {
    return await this.appointmentService.findAll(PaginationDto, user.email);
  }

  @Get('/completed')
  @ApiBearerAuth('access_token')
  async findCompleted(@Query() PaginationDto: PaginationDto) {
    return await this.appointmentService.findCompleted(PaginationDto);
  }

  @Get(':id')
  @ApiBearerAuth('access_token')
  async findById(@Param('id') id: string) {
    return await this.appointmentService.findById(id);
  }

  @Get('/clinic/:clinicId/stats')
  @ApiBearerAuth('access_token')
  async getStats(@Param('clinicId') clinicId: string) {
    return await this.appointmentService.getStats(clinicId);
  }

  @Get('/clinic/:clinicId/:doctorId')
  @ApiBearerAuth('access_token')
  async findAppointmentsByClinicAndDoctor(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string) {
    return await this.appointmentService.findAppointmentsByClinicAndDoctor(clinicId, doctorId);
  }

  @Delete(':id')
  @ApiBearerAuth('access_token')
  async deleteById(@Param('id') id: string) {
    await this.appointmentService.deleteById(id);
  }

  @Put(':id')
  @ApiBearerAuth('access_token')
  async update(
    @Param('id') id: string,
    @Body() appointmentDto: AppointmentDto,
  ) {
    return this.appointmentService.update(id, appointmentDto);
  }

  @Put(':id/complaint')
  @ApiBearerAuth('access_token')
  async UpdateComplaint(
    @Param('id') id: string,
    @Body('complaint') complaint: string,
  ) {
    return this.appointmentService.addComplaint(id, complaint);
  }

  @Put(':id/visit-summary')
  @ApiBearerAuth('access_token')
  async UpdateVisitSummary(
    @Param('id') id: string,
    @Body('visit_summary') visit_summary: string,
  ) {
    return this.appointmentService.addVisitSummary(id, visit_summary);
  }

  @Put(':id/treatment-plan')
  @ApiBearerAuth('access_token')
  async UpdateTreatmentPlan(
    @Param('id') id: string,
    @Body('treatment_plan') treatment_plan: string,
  ) {
    return this.appointmentService.addTreatmentPlan(id, treatment_plan);
  }

  @Put(':id/medical-record')
  @ApiBearerAuth('access_token')
  async addMedicalRecord(
    @Param('id') id: string,
    @Body('medical_record') medical_record: string,
  ) {
    return this.appointmentService.addMedicalRecord(id, medical_record);
  }

  @Post('/status-update')
  @ApiBearerAuth('access_token')
  async updateStatus(
    @Body() statusUpdateDto: StatusUpdateDto,
  ) {
    return await this.appointmentService.updateStatus(statusUpdateDto);
  }

  @Post('/cancel')
  @ApiBearerAuth('access_token')
  async deleteAppointment(
    @Body() cancelAppointmentDto: CancelAppointmentDto,
    @AuthenticatedUser() user
  ) {
    return await this.appointmentService.cancelAppointment(cancelAppointmentDto, user.email);
  }

  @Put('/:id/assign-doctor')
  @ApiBearerAuth('access_token')
  async assignDoctor(
    @Param('id') id: string,
    @AuthenticatedUser() user
  ) {
    return await this.appointmentService.startAppointment(id, user.email);
  }

  @Get('/receiptionist/clinic/:clinicId')
  @ApiBearerAuth('access_token')
  async findAllForReceptionist(
    @Query() paginationDto: PaginationWithFiltersDto,
    @Param('clinicId') clinicId: string
  ) {
    return await this.appointmentService.findAllForReceptionist(paginationDto, clinicId);
  }

  @Put(':id/mark-present')
  @ApiBearerAuth('access_token')
  async markPatientAsPresent(@Param('id') id: string) {
    return await this.appointmentService.markPatientAsPresent(id);
  }
}