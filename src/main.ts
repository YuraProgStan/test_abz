import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get(ConfigService);
  const prefix = config.get<string>('app.PREFIX');
  app.setGlobalPrefix(prefix);
  // app.enableCors({
  //   origin: config.get<string>('client.URL'),
  // });
  app.enableCors({
    origin: true,
  });
  const port = config.get<number>('app.PORT') || 5000;
  await app.listen(port);
}
bootstrap();
