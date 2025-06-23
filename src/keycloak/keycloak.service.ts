import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { createUserDto } from 'src/users/dto/create-user.dto';
import { UserService } from 'src/users/user.service';
import { LoginUserDTO } from 'src/users/dto/login-user.dto';
import { RoleService } from 'src/roles/roles.service';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mailer/mail.service';
@Injectable()
export class KeycloakService {

  private keycloakUrl = this.configService.get('KEYCLOAK_URL');
  private realm = this.configService.get('KEYCLOAK_REALM');
  private clientId = this.configService.get('KEYCLOAK_CLIENT_ID');
  private client_secret = this.configService.get('KEYCLOAK_CLIENT_PASSWORD');

  constructor(private configService: ConfigService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly mailService: MailService
  ) { }

  async getAdminAccessToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.client_secret
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data.access_token;
    } catch (error) {
      throw new HttpException(error, HttpStatus.UNAUTHORIZED);
    }
  }

  public async createUser(createUserDto: createUserDto, email: string) {
    try {
      const token = await this.getAdminAccessToken();
      const password = randomBytes(5).toString('hex');
      createUserDto.password = password;
      const keycloakUser = this.buildKeycloakUser(createUserDto);
      const keycloakUserId = await this.createUserInKeycloak(keycloakUser, token);
      const role = await this.roleService.findById(createUserDto.role_id)
      await this.assignRoleToUser(keycloakUserId, role.keycloak_id, role.name);
      createUserDto.keycloak_id = keycloakUserId;
      const mongoUser = await this.createUserInDatabase(createUserDto, email);
      this.mailService.sendMail(
        createUserDto.email,
        'New Password',
        'welcome',
        { 'name': `${createUserDto.firstName} ${createUserDto.lastName}`, password }
      )
      return mongoUser;
    } catch (error) {
      throw new HttpException(error.message || 'User creation failed', HttpStatus.BAD_REQUEST);
    }
  }

  private buildKeycloakUser(createUserDto: createUserDto): any {
    return {
      username: createUserDto.username,
      enabled: true,
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      credentials: [
        {
          type: 'password',
          value: createUserDto.password,
          temporary: false,
        },
      ],
    };
  }

  private async createUserInKeycloak(user: any, token: string) {
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const { headers: responseHeaders } = await axios.post(url, user, { headers });
    const location = responseHeaders['location'];
    const userId = location.split('/').pop();
    return userId;
  }

  async updateUser(userId: string, userData: any, email: string) {
    this.updateUserInKeycloak(userId, userData);
    return this.userService.update(userId, userData, email);
  }

  async updateUserInKeycloak(userId: string, userData: any) {
    const user = await this.userService.findOne(userId);
    const token = await this.getAdminAccessToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${user.keycloak_id}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    await axios.put(url, {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    }, { headers });
  }

  async updateUserPasswordInKeycloak(userId: string, password: string) {
    const token = await this.getAdminAccessToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    await axios.put(url, {
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    }, { headers });
  }

  private async createUserInDatabase(createUserDto: createUserDto, email: string) {
    return await this.userService.create(createUserDto, email);
  }

  public async login(loginUserDTO: LoginUserDTO) {
    const response = await axios.post(
      `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.client_secret,
        username: loginUserDTO.email,
        password: loginUserDTO.password,
        scope: "openid"
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    this.userService.updateUserActivity(loginUserDTO.email);

    return response.data;
  }

  public async refreshToken(refresh_token: string) {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.client_secret,
          refresh_token,
          scope: "openid profile email"
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data;

    } catch (error) {
      console.log(error)
      throw new UnauthorizedException();
    }
  }

  async getUserInfo(accessToken: string) {

    try {
      const response = await axios.get(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
        }
      );
      const { email } = response.data;
      const userId = await this.userService.findByEmail(email);
      const user = await this.userService.findOne(userId._id.toString());
      return {
        'id': userId._id.toString(),
        user,
      };

    } catch (error) {
      throw new Error(error);
    }
  }

  async getRoles(): Promise<any[]> {
    const token = await this.getAdminAccessToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/roles`;

    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    return data;
  }

  async changePassword(id: string) {
    const mongoUser = await this.userService.findOne(id);
    const password = randomBytes(5).toString('hex');
    this.updateUserPasswordInKeycloak(mongoUser.keycloak_id, password)
    this.userService.changePassword(mongoUser, password)
    await this.mailService.sendMail(
      mongoUser.email,
      'Change Password',
      'password-change',
      { 'name': mongoUser.firstName, password }
    );
  }

  async assignRoleToUser(userId: any, roleId: string, roleName: string): Promise<void> {
    const token = await this.getAdminAccessToken();
    const url = `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;

    const { data } = await axios.post(url,
      [{ id: roleId, name: roleName }],
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      },
    );
    return data;
  }


}
