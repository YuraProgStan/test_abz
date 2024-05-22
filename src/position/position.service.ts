import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { Position } from '@prisma/client';

@Injectable()
export class PositionService {
  constructor(private prismaService: PrismaService) {}
  findAll(): Promise<Position[]> {
    return this.prismaService.position.findMany();
  }
}
