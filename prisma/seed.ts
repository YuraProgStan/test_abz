import { Position, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import sizeOf from 'image-size';
import { validateSync, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from "../src/user/dto/create-user.dto";
import { ALLOWED_FILE_EXTENSIONS, IMAGE_DIMENSION, MAX_FILE_SIZE } from '../src/constants';
import { FileUploadAwsService } from '../src/fileupload-aws/fileupload-aws.service';
import { ConfigService } from '@nestjs/config';
import { cropImageToCenter } from '../src/utils/crop-image';
import { optimizeImage } from '../src/utils/optimize-image';
import * as dayjs from 'dayjs';
import { editFileName } from '../src/utils/edit.file.name';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";


const prisma = new PrismaClient();

class CreateUserSeedDto extends CreateUserDto {
    @IsNotEmpty({ message: 'Photo is required.' })
    photo: string;

    static validatePhotoExtension(photoUrl: string): boolean {
        if (photoUrl.includes('avatars.githubusercontent.com')) {
            return true;
        }

        const extension = photoUrl.split('.').pop()?.toLowerCase();
        return ALLOWED_FILE_EXTENSIONS.includes(extension ?? '');
    }
}

// async function createPositions(): Promise<Position[]> {
//   const positionNames = [
//     'Developer',
//     'Designer',
//     'Manager',
//     'HR',
//     'Sales',
//     'Marketing',
//     'Support',
//     'Finance',
//     'Admin',
//     'Legal',
//   ];
//   const positions: Position[] = [];
//
//   for (const positionName of positionNames) {
//     const position = await prisma.position.create({
//       data: { name: positionName },
//     });
//     positions.push(position);
//   }
//
//   return positions;
// }

async function validateImage(buffer: Buffer, url: string): Promise<boolean> {
    if (buffer.length > MAX_FILE_SIZE) {
        console.log(`Image size exceeds limit: ${url}`);
        return false;
    }

    const dimensions = sizeOf(buffer);
    if (
        dimensions.width < IMAGE_DIMENSION ||
        dimensions.height < IMAGE_DIMENSION
    ) {
        console.log(`Image dimensions are too small: ${url}`);
        return false;
    }

    if (!CreateUserSeedDto.validatePhotoExtension(url)) {
        console.log(`Invalid photo extension: ${url}`);
        return false;
    }

    return true;
}


function generatePhoneNumber() {
  const format = '+380#########';
  return format.replace(/#/g, () => Math.floor(Math.random() * 10).toString());
}
async function createUsers(positions: Position[], configService: ConfigService) {
    const fileUploadAwsService = new FileUploadAwsService(configService);

    for (let i = 0; i < 45; i++) {
        const position = faker.helpers.arrayElement(positions);
        let photoUrl = faker.image.avatar();
        let buffer: Buffer;

        do {
            const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
            buffer = Buffer.from(response.data, 'binary');
        } while (!await validateImage(buffer, photoUrl));

        const croppedImageBuffer = await cropImageToCenter(buffer);

        const apiKey = configService.get<string>('tinify.API_KEY');
        const optimizedImageBuffer = await optimizeImage(
            croppedImageBuffer,
            apiKey,
        );

        const subfolder = dayjs().format('DD_MM_YYYY');
        const editedFileName = editFileName({ originalname: 'photo.jpg' });
        const fileName = `test_abz/${subfolder}/photo/${editedFileName}`;
        const fileUrl = await fileUploadAwsService.uploadFile(
            optimizedImageBuffer,
            fileName,
        );

        const user = new CreateUserSeedDto();
        user.name = faker.person.fullName();
        user.email = faker.internet.email();
        user.phone = generatePhoneNumber();
        user.position_id = position.id;
        user.photo = fileUrl;

        const errors = validateSync(user);
        if (errors.length > 0) {
            console.log('Validation failed: ', errors);
            continue;
        }

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                position_id: user.position_id,
                photo: user.photo,
            },
        });
    }
}

async function main() {
  // const positions = await createPositions();
    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);

    const positions = await prisma.position.findMany();
    await createUsers(positions, configService);

    await prisma.$disconnect();
    await app.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
