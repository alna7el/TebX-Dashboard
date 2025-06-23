import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SeederService } from './seeds/seeder.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3333;
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Tebx docs')
    .setDescription('This is tebx documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access_token',
    )

    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
      requestInterceptor: (req) => {
        const isLogin = req.url.includes('/auth/login');

        if (isLogin) {
          req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        } else {
          const token = localStorage.getItem('access_token');
          if (token) {
            req.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        return req;
      },
      responseInterceptor: (res) => {
        if (res.url.includes('/auth/login') && res.ok) {
          res.clone().json().then((data) => {
            if (data.access_token) {
              localStorage.setItem('access_token', data.access_token);
              console.log('Token stored in localStorage!');
            }
          });
        }
        return res;
      },
    }
  });
  const seederService = app.get(SeederService);
  await seederService.seed();
  await app.listen(port);
}
bootstrap();
