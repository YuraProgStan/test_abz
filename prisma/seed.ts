import {Position, PrismaClient} from '@prisma/client';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import sizeOf from 'image-size';
import { validateSync, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from "../src/user/dto/create-user.dto";
import { ALLOWED_FILE_EXTENSIONS, IMAGE_DIMENSION, MAX_FILE_SIZE } from "../src/constants";



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

async function validateImage(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

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
  } catch (error) {
    console.error(`Error validating image: ${url}`, error);
    return false;
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

function generatePhoneNumber() {
  const format = '+380#########';
  return format.replace(/#/g, () => Math.floor(Math.random() * 10).toString());
}
async function createUsers(positions: Position[]) {
  for (let i = 0; i < 45; i++) {
    const position = faker.helpers.arrayElement(positions);
    let photoUrl = faker.image.avatar();

    // Validate image
    while (!(await validateImage(photoUrl))) {
      photoUrl = faker.image.avatar();
    }

    const user = new CreateUserSeedDto();
    user.name = faker.person.fullName();
    user.email = faker.internet.email();
    user.phone = generatePhoneNumber();
    user.position_id = position.id;
    user.photo = photoUrl;

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
  const positions = await prisma.position.findMany();
  await createUsers(positions);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
