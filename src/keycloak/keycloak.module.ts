import { Module } from '@nestjs/common';
import { KeycloakService } from './keycloak.service';
import { KeycloakController } from './keycloak.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { MailModule } from 'src/mailer/mail.module';
import { IsSpecialityRequiredConstraint } from 'src/users/validators/is-speciality-required.validator';

@Module({
  imports: [UsersModule, RolesModule, MailModule],
  providers: [KeycloakService, IsSpecialityRequiredConstraint],
  controllers: [KeycloakController],
  exports: [KeycloakService]
})
export class KeycloakModule { }
