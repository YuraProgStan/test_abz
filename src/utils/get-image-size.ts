import fromBuffer from 'image-size';
import { BadRequestException } from '@nestjs/common';

export async function getImageSize(
  fileBuffer: Buffer,
): Promise<{ width: number; height: number }> {
  try {
    const dimensions = fromBuffer(fileBuffer);
    if (!(!dimensions || !dimensions.width || !dimensions.height)) {
      return { width: dimensions.width, height: dimensions.height };
    } else {
      throw new Error('Invalid image dimensions');
    }
  } catch (error) {
    throw new BadRequestException('Invalid image file');
  }
}
