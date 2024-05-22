import { ParseFilePipe, ParseFileOptions } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

export class CustomParseFilePipe extends ParseFilePipe {
  constructor(options: ParseFileOptions) {
    super(options);
  }

  protected createExceptionFactory() {
    return (errors) => {
      const messages = errors.map((error) => {
        if (error.constraints) {
          if (error.constraints.maxFileSize) {
            return 'The photo may not be greater than 5 Mbytes.';
          }
          if (error.constraints.fileType) {
            return 'The photo format must be jpeg/jpg type.';
          }
        }
        return error.toString();
      });

      return new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: messages,
      });
    };
  }
}
