import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { GlobalErrorFilter } from './common/filters/globalError.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 4000);

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new GlobalErrorFilter());

  await app.listen(port);
}

void bootstrap();
