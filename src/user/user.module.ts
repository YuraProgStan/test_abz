import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../core/prisma.service';
import { TokenService } from '../token/token.service';
import { JwtService } from '@nestjs/jwt';
import { FileUploadAwsService } from '../fileupload-aws/fileupload-aws.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    TokenService,
    JwtService,
    FileUploadAwsService,
  ],
})
export class UserModule {}
