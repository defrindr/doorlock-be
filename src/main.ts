import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { join } from 'path';
import { env } from 'process';
import { AppModule } from './app.module';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  NestjsRedoxModule,
  NestJSRedoxOptions,
  RedocOptions,
} from 'nestjs-redox';
import * as qs from 'qs';
import { AppConfig } from './config/index';
import { createValidationException } from './shared/core/factories/validation-exception.factory';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyMultipart = require('@fastify/multipart');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyStatic = require('@fastify/static');

async function bootstrap() {
  let port = AppConfig.port;

  // check --port and --host
  if (process.argv.includes('--port')) {
    port = parseInt(process.argv[process.argv.indexOf('--port') + 1]);
  }

  const fastifyAdapter = new FastifyAdapter({
    querystringParser(str) {
      return qs.parse(str);
    },
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      // logger: ['warn', 'error', 'log'],
    },
  );
  app.useWebSocketAdapter(new WsAdapter(app));

  // Register multipart plugin for file uploads
  app.register(fastifyMultipart, {
    limits: { fileSize: AppConfig.maxFileSize }, // 10MB
  });

  // Register static file serving for uploads
  app.register(fastifyStatic, {
    root: join(process.cwd(), 'public'),
    prefix: '/static/',
  });

  app.enableCors({
    origin: '*', // allow your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // if you use cookies or Authorization headers
  });

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
      transformOptions: {
        enableImplicitConversion: true, // Allows for automatic type conversion
      },
      exceptionFactory: createValidationException,
    }),
  );
  // app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle(env.APP_NAME ?? 'Nest App')
    .setDescription(env.APP_DESCRIPTION ?? '-')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs-swagger', app, document);

  const redocOptions: RedocOptions = {
    requiredPropsFirst: true,
    theme: {
      sidebar: {
        width: '222px',
      },
    },
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: true,
    disableGoogleFont: true,
    standalone: true,
  };

  // Instead of using SwaggerModule.setup() you call this module
  await NestjsRedoxModule.setup(
    '/docs',
    app,
    document,
    redoxOptions,
    redocOptions,
  );

  await app.listen(port, AppConfig.host);

  Logger.log(`🚀 ${AppConfig.name} is listening on ${await app.getUrl()}`);
}

bootstrap();
