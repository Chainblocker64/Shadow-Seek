import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  if (!allowedOrigin) {
    new Logger().error(
      'FATAL ERROR: ALLOWED_ORIGIN environment variable is not defined.',
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
