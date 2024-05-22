import tinify from 'tinify';
import { BadRequestException } from '@nestjs/common';
export async function optimizeImage(
  imageBuffer: Buffer,
  apiKey: string,
): Promise<Buffer> {
  try {
    tinify.key = apiKey;
    const optimizedImage = await tinify.fromBuffer(imageBuffer).toBuffer();
    if (optimizedImage) {
      return Buffer.from(optimizedImage);
    }
  } catch (error) {
    throw new BadRequestException("Can't optimize image with tinify ip");
  }
}
