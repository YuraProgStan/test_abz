import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [TokenController],
  providers: [TokenService, JwtService],
})
export class TokenModule {}
