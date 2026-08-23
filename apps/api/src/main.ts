import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './common/filters/globalError.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.WEB_URL,
    credentials: true,
  });
  const port = Number(process.env.PORT ?? 4000);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new GlobalErrorFilter());
  const config = new DocumentBuilder()
    .setTitle('HR Management API')
    .setDescription('HR Management backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}

void bootstrap();
