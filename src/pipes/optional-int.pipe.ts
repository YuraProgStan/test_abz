import { Injectable, BadRequestException } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

@Injectable()
export class OptionalIntPipe extends ParseIntPipe {
  transform(value: any) {
    if (value === undefined) return value;
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    }
    return val;
  }
}
