import { Controller, Get, Param, Query } from "@nestjs/common";
import { PrescriptionService } from "./prescription.service";
import { PaginationDto } from "./dto/pagination.dto";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';



@ApiTags('prescription')
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) { }
  @Get()
  async findAll(@Query() paginationDto: PaginationDto, @AuthenticatedUser() user: any) {
    return await this.prescriptionService.findAll(paginationDto, user.email);
  }

  @Get(':id')
  @ApiBearerAuth('access_token')
  async findById(@Param('id') id: string) {
    const prescription = await this.prescriptionService.findById(id);
    return { prescription }
  }
}