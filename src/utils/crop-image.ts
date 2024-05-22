import * as sharp from 'sharp';
import { IMAGE_DIMENSION } from '../constants';

export async function cropImageToCenter(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(IMAGE_DIMENSION, IMAGE_DIMENSION, {
      fit: 'cover',
      position: 'center',
    })
    .toBuffer();
}
