import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { Clinic } from './schemas/clinic.schema';
import { ClinicListDto } from './dto/clinic-list.dto';
import { ClinicDto } from './dto/clinic.dto';
import { ListUserDto } from 'src/users/dto/list-user.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('clinics')
@Controller('clinics')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) { }

  @Get()
  @ApiBearerAuth('access_token')
  async findAll(@Query() clinicListDto: ClinicListDto) {
    return this.clinicService.findAll(clinicListDto);
  }

  @Get(':id')
  @ApiBearerAuth('access_token')
  async findOne(@Param('id') id: string): Promise<Clinic> {
    return this.clinicService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access_token')
  async create(@Body() clinicDto: ClinicDto, @AuthenticatedUser() authUser: any) {
    const clinic = await this.clinicService.create(clinicDto, authUser.email);
    return { clinic }
  }

  @Put(':id')
  @ApiBearerAuth('access_token')
  async update(@Param('id') id: string, @Body() clinicDto: ClinicDto, @AuthenticatedUser() authUser: any) {
    const clinic = await this.clinicService.update(id, clinicDto, authUser.email);
    return { clinic }
  }

  @Get('/:id/users')
  @ApiBearerAuth('access_token')
  async getClinicUsers(@Param('id') id: string, @Query() listUserDto: ListUserDto) {
    return await this.clinicService.getClinicUsers(id, listUserDto);
  }

  @Get('/:id/doctors')
  @ApiBearerAuth('access_token')
  async getClinicDoctors(@Param('id') id: string) {
    return await this.clinicService.getClinicDoctors(id);
  }

}