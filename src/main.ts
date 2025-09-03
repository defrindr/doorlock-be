import {
  HttpException,
  HttpStatus,
  Logger,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';
import { log } from 'console';
import { env } from 'process';
import { AppModule } from './app.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/index';

async function bootstrap() {
  let port = AppConfig.port;

  // check --port and --host
  if (process.argv.includes('--port')) {
    port = parseInt(process.argv[process.argv.indexOf('--port') + 1]);
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({}),
  );

  app.enableVersioning({
    type: VersioningType.URI, // or HEADER, MEDIA_TYPE, CUSTOM
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      disableErrorMessages: false,
      exceptionFactory: (errors: any) => {
        const response: any = {
          code: 400,
          error: 'Bad Request',
          message: [],
        };

        log(`Errors: ${JSON.stringify(errors)}`);

        return new HttpException(response, HttpStatus.BAD_REQUEST);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(env.APP_NAME ?? 'Nest App')
    .setDescription(env.APP_DESCRIPTION ?? '-')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, AppConfig.host);

  Logger.log(`🚀 ${AppConfig.name} is listening on ${await app.getUrl()}`);
}

bootstrap();
