import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/index';
import { PrismaService } from './core/prisma.service';
import { TokenModule } from './token/token.module';
import { PositionModule } from './position/position.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    UserModule,
    TokenModule,
    PositionModule,
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
