import { Controller, Post, Body, Get, Req, Put, Param } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';
import { createUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDTO } from 'src/users/dto/login-user.dto';
import { Request } from 'express';
import { MailService } from 'src/mailer/mail.service';

@Controller('user')
export class KeycloakController {
  constructor(private readonly keycloakService: KeycloakService,
    private readonly mailService: MailService
  ) { }

  @Post('register')
  async registerUser(
    @Body() createUserDto: createUserDto,
    @AuthenticatedUser() authUser: any
  ) {
    const user = await this.keycloakService.createUser(createUserDto, authUser.email);
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() createUserDto: createUserDto,
    @AuthenticatedUser() authUser: any
  ) {
    const user = await this.keycloakService.updateUser(id, createUserDto, authUser.email);
    return user;
  }

  @Post('login')
  @Unprotected()
  async login(@Body() loginUserDTO: LoginUserDTO) {
    return await this.keycloakService.login(loginUserDTO);

  }

  @Post('/refresh-token')
  @Unprotected()
  async refreshToken(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;
    return await this.keycloakService.refreshToken(refresh_token);
  }

  @Get('/info')
  async getUserInfo(@Req() req: Request) {
    const accessToken = req.headers['authorization'];
    const mongoUser = await this.keycloakService.getUserInfo(accessToken);
    return {
      "id": mongoUser.id,
      "name": mongoUser.user.firstName,
      "email": mongoUser.user.email,
      "role": mongoUser.user.role_id,
      "clinics": mongoUser.user.clinics
    }
  }

  @Unprotected()
  @Get('/roles-keycloak')
  async getKeycloakRoles() {
    return this.keycloakService.getRoles();
  }

  @Put('password-change/:id')
  async changePassword(@Param('id') id: string) {
    return this.keycloakService.changePassword(id)
  }

}
