import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 4000);

  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(port);
}

void bootstrap();
