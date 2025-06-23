import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { DoctorAttendanceService } from "./doctor-attendance.service";
import { DoctorAttendanceDto } from "./dto/doctor-attendance.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('doctor-attendance')
@Controller('doctor-attendance')
export class DoctorAttendanceController {
  constructor(private readonly doctorAttendanceService: DoctorAttendanceService) { }

  @Post('/')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create doctor attendance record(s)' })
  @ApiResponse({
    status: 201,
    description: 'The attendance record(s) have been successfully created.'
  })
  async create(@Body() doctorAttendanceDto: DoctorAttendanceDto) {
    return await this.doctorAttendanceService.create(doctorAttendanceDto);
  }

  @Get('/:clinic')
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all doctors attendance for a clinic' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of doctors who are present at the clinic for the current day.',
  })
  async findAttendanceByClinic(@Param('clinic') clinic: string) {
    return await this.doctorAttendanceService.findAttendanceByClinic(clinic);
  }
}
