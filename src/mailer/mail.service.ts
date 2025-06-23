import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';


@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) { }

  async sendMail(to: string, subject: string, template: string, context: any) {
    return await this.mailerService
      .sendMail({
        to,
        from: this.configService.get<string>('MAIL_FROM_ADDRESS'),
        subject,
        template,
        context
      })
  }
}
