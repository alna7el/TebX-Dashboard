import { Controller, Get } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';
import { RoleService } from './roles.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Unprotected()
  @Get()
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      roles
    }
  }


}