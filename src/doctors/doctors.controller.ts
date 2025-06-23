import { Controller, Get, Query, Param } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { AppointmentFiltersDto } from "src/practitionar/filters/appointments.filters.dto";
import { AuthenticatedUser } from "nest-keycloak-connect";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('doctor')
@Controller('/doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService
  ) { }

  @Get('appointments')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get doctor appointments', description: 'Retrieves all appointments for the authenticated doctor with optional date filters' })
  @ApiQuery({ type: AppointmentFiltersDto })
  @ApiResponse({ status: 200, description: 'Returns list of appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAppointments(@Query() appointmentFiltersDto: AppointmentFiltersDto,
    @AuthenticatedUser() user: any) {
    return await this.doctorService.getAppointments(appointmentFiltersDto, user.email);
  }

  @Get('appointments/completed')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get completed appointments', description: 'Retrieves all completed appointments for the authenticated doctor with optional date filters' })
  @ApiQuery({ type: AppointmentFiltersDto })
  @ApiResponse({ status: 200, description: 'Returns list of completed appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCompletedAppointments(@Query() appointmentFiltersDto: AppointmentFiltersDto,
    @AuthenticatedUser() user: any) {
    return await this.doctorService.getCompletedAppointments(appointmentFiltersDto, user.email);
  }

  @Get('/appointments/status-stats')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get appointment statistics', description: 'Retrieves statistics about completed and not completed appointments for the authenticated doctor' })
  @ApiResponse({
    status: 200,
    description: 'Returns appointment statistics',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            completed: { type: 'number' },
            notCompleted: { type: 'number' }
          }
        },
        clinics: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAppointmentsStatusStats(@AuthenticatedUser() user: any) {
    return await this.doctorService.getAppointmentsStatusStats(user.email);
  }

  @Get('/clinics')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get doctor clinics', description: 'Retrieves all clinics associated with the authenticated doctor' })
  @ApiResponse({ status: 200, description: 'Returns list of clinics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getClinics(@AuthenticatedUser() user: any) {
    return await this.doctorService.getClinics(user.email);
  }

  @Get('/branches')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get doctor branches', description: 'Retrieves all branches associated with the authenticated doctor' })
  @ApiResponse({ status: 200, description: 'Returns list of branches' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBranches(@AuthenticatedUser() user: any) {
    return await this.doctorService.getBranches(user.email);
  }

  @Get('/clinic/:clinicId/doctors')
  @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Get doctors by clinic',
    description: 'Retrieves all doctors in a specific clinic along with their appointment statistics (completed, booked, and remaining appointments)'
  })
  @ApiParam({
    name: 'clinicId',
    description: 'ID of the clinic to get doctors from',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of doctors with their appointment statistics',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          doctor: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              firstNameAR: { type: 'string' },
              lastNameAR: { type: 'string' }
            }
          },
          stats: {
            type: 'object',
            properties: {
              completed: { type: 'number' },
              booked: { type: 'number' },
              remaining: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Clinic not found' })
  async getDoctorsByClinic(@Param('clinicId') clinicId: string) {
    return await this.doctorService.listDoctorsByClinic(clinicId);
  }
}