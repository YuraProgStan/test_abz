import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

export default async function handler(req, res) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    app.getHttpAdapter().getInstance()(req, res);
}
