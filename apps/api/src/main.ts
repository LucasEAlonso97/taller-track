import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') ?? 3000;
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ??
    'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
  });

  await app.listen(port);

  console.log(`API disponible en http://localhost:${port}/api`);
}

void bootstrap();