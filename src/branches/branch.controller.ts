import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchDto } from './dto/branch.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { ListUserDto } from 'src/users/dto/list-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) { }

  @Get()
  @ApiBearerAuth('access_token')
  async findAll(@Query() paginationDto: PaginationDto) {
    const branches = await this.branchService.findAll(paginationDto);
    return {
      branches
    }
  }

  @Post()
  @ApiBearerAuth('access_token')
  async create(@Body() branchDto: BranchDto, @AuthenticatedUser() authUser: any) {
    return await this.branchService.create(branchDto, authUser.email);
  }

  @Get(':id')
  @ApiBearerAuth('access_token')
  async show(@Param('id') id: string) {
    return await this.branchService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('access_token')
  async update(
    @Param('id') id: string,
    @Body() branchDto: BranchDto,
    @AuthenticatedUser() authUser: any) {
    return this.branchService.update(id, branchDto, authUser.email);
  }
  @Put('/:id/assign-user')
  @ApiBearerAuth('access_token')
  async assignUser(
    @Param('id') id: string,
    @Body('user_id') user_id: string) {
    return await this.branchService.assignUser(id, user_id);
  }

  @Get('/:id/users')
  @ApiBearerAuth('access_token')
  async getBranchUsers(@Param('id') id: string, @Query() listUserDto: ListUserDto) {
    return await this.branchService.getBranchUsers(id, listUserDto);
  }

}