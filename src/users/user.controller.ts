import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { ListUserDto } from './dto/list-user.dto';
import { createUserDto } from './dto/create-user.dto';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @ApiBearerAuth('access_token')
  async findAll(@Query() listUserDto: ListUserDto) {
    return this.userService.findAll(listUserDto);
  }

  @Get(':id')
  @ApiBearerAuth('access_token')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('access_token')
  async update(@Param('id') id: string,
    @Body() createUserDto: createUserDto,
    @AuthenticatedUser() authUser: any
  ): Promise<User> {
    return this.userService.update(id, createUserDto, authUser.email);
  }

  @Delete(':id/branch')
  @ApiBearerAuth('access_token')
  async removeBranchFromUser(@Param('id') id: string) {
    return await this.userService.removeBranchFromUser(id);
  }

  @Put(':id/clinic')
  @ApiBearerAuth('access_token')
  async updateUserClinic(@Param('id') id: string,
    @Body('clinic') clinic: string,
    @Body('branch') branch: string,
  ): Promise<User> {
    return this.userService.assignClinicToUser(id, clinic, branch);
  }

  @Delete(':id/clinic')
  @ApiBearerAuth('access_token')
  async removeClinicFromUser(@Param('id') id: string,
    @Query('clinicId') clinicId: string
  ) {
    return await this.userService.removeClinicFromUser(id, clinicId);
  }
}