import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const allowedOrigin = process.env.FRONTEND_URL;

  if (!allowedOrigin) {
    new Logger().error(
      'FATAL ERROR: FRONTEND_URL environment variable is not defined.',
    );
    process.exit(1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.set('trust proxy', 1);

  app.enableCors({
    origin: allowedOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.use(cookieParser());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log('Application is running on port ' + port);
}
void bootstrap();
