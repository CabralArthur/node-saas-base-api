import { NestFactory } from '@nestjs/core';
import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedPlans } from './subscription/subscription.seed';

import { AppModule } from './app.module';
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NodeJS Base API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Run seeds
  const dataSource = app.get(DataSource);
  await seedPlans(dataSource);

  await app.listen(configuration.port);
}
bootstrap();
