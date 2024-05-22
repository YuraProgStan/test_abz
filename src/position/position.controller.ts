import { Controller, Get } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @Get()
  findAll() {
    return this.positionService.findAll();
  }
}
