import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';

let cachedServer;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.init();
    return app.getHttpAdapter().getInstance();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!cachedServer) {
        cachedServer = await bootstrap();
    }
    return cachedServer(req, res);
}
