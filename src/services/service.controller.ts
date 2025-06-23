import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ServiceService } from "./service.service";
import { PaginationDto } from "./dto/pagination.dto";
import { ServiceDto } from "./dto/service.dto";
import { AuthenticatedUser } from "nest-keycloak-connect";

@Controller('services')
export class ServiceController {
  constructor(private readonly servivceService: ServiceService) {
  }
  @Get('/')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.servivceService.findAll(paginationDto);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() serviceDto: ServiceDto, @AuthenticatedUser() authUser: any) {
    await this.servivceService.update(id, serviceDto, authUser.email);
  }

  @Post('/')
  async create(@Body() serviceDto: ServiceDto, @AuthenticatedUser() authUser: any) {
    const service = await this.servivceService.create(serviceDto, authUser.email);
    return { service }
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    const service = await this.servivceService.findById(id);
    return service
  }

  @Put('/:id/status')
  async updateStatus(@Param('id') id: string) {
    const service = await this.servivceService.changeStatus(id);
    return { service }
  }
}