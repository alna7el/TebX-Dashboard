import { Body, Controller, Get, Param, Post, Put, Query, Headers } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PatientService } from './patient.service';
import { PatientDto } from './dto/patient.dto';
import { PatientListDto } from './dto/patient-list.dto';
import { VitalSignDTO } from './dto/vital-sign.dto';
import { PrescriptionDto } from './dto/prescription.dto';
import { DiagnosisDTO } from './dto/diagnosis.dto';
import { AppointmentDto } from './dto/appointment.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  @Get()
  async findAll(
    @Query() patientListDto: PatientListDto,
    @Headers('accept-language') acceptLanguage: string
  ) {
    const patients = await this.patientService.findAll(patientListDto, acceptLanguage);
    return {
      patients
    }
  }

  @Post()
  async create(@Body() patientDto: PatientDto,
    @AuthenticatedUser() authUser: any) {
    const patient = await this.patientService.create(patientDto, authUser.email);
    return { patient }
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const patient = await this.patientService.findOne(id);
    return { patient }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() patientDto: PatientDto,
    @AuthenticatedUser() authUser: any) {
    const patient = await this.patientService.update(id, patientDto, authUser.email);
    return { patient }
  }

  @Post('/vital-sign')
  async addVitalSigns(@Body() vitalSignDTO: VitalSignDTO) {
    await this.patientService.addVitalSigns(vitalSignDTO);
    const patient = await this.patientService.findOne(vitalSignDTO.patient.toString());
    return { patient }
  }

  @Post('/prescription')
  async addPrescription(@Body() PrescriptionDto: PrescriptionDto,
    @AuthenticatedUser() user: any) {
    await this.patientService.addPrescription(PrescriptionDto, user.email);
    const patient = await this.patientService.findOne(PrescriptionDto.patient.toString());
    return { patient }
  }

  @Post('/diagnosis')
  async addDiagnosis(@Body() diagnosisDTO: DiagnosisDTO) {
    await this.patientService.addDiagnosis(diagnosisDTO);
    const patient = await this.patientService.findOne(diagnosisDTO.patient.toString());
    return { patient }
  }

  @Get(':id/appointments')
  async findAppointments(@Param('id') id: string, @Query() appointmentDto?: AppointmentDto) {
    const appointments = await this.patientService.getAppointments(id, appointmentDto);
    return { appointments }
  }



}