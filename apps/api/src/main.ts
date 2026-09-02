import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  NestExpressApplication,
} from '@nestjs/platform-express';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.set(
    'trust proxy',
    1,
  );

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService =
    app.get(ConfigService);

  const port =
    configService.get<number>(
      'PORT',
    ) ?? 3000;

  const frontendUrl =
    configService.get<string>(
      'FRONTEND_URL',
    ) ??
    'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
  });

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `API disponible en puerto ${port}`,
  );
}

void bootstrap();