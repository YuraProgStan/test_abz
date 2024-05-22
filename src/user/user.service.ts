import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { cropImageToCenter } from '../utils/crop-image';
import { ConfigService } from '@nestjs/config';
import { FileUploadAwsService } from '../fileupload-aws/fileupload-aws.service';
import * as dayjs from 'dayjs';
import { editFileName } from '../utils/edit.file.name';
import { UserWithPosition } from './interfaces/user-with-position.interface';
import { UserInterface } from './interfaces/user.interface';
import { PrismaService } from '../core/prisma.service';
import { optimizeImage } from '../utils/optimize-image';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private fileUploadAwsService: FileUploadAwsService,
  ) {}

  async create(createUserDto: CreateUserDto, photo: Express.Multer.File) {
    const { email, phone } = createUserDto;

    // Check if email or phone number already exists in the database
    if ((await this.emailExists(email)) || (await this.phoneExists(phone))) {
      throw new ConflictException({
        success: false,
        message: 'User with this phone or email already exists',
      });
    }
    const position = await this.prismaService.position.findUnique({
      where: { id: Number(createUserDto.position_id) },
    });

    if (!position) {
      throw new NotFoundException({
        success: false,
        message: 'Position not found',
      });
    }
    const croppedImageBuffer = await cropImageToCenter(photo.buffer);

    const apiKey = this.configService.get<string>('tinify.API_KEY');
    const optimizedImageBuffer = await optimizeImage(
      croppedImageBuffer,
      apiKey,
    );

    const subfolder = dayjs().format('DD_MM_YYYY');
    const editedFileName = editFileName(photo);
    const fileName = `test_abz/${subfolder}/photo/${editedFileName}`;
    const fileUrl = await this.fileUploadAwsService.uploadFile(
      optimizedImageBuffer,
      fileName,
    );

    const createUserDtoWithPhoto: UserInterface = {
      ...createUserDto,
      photo: fileUrl,
      position_id: Number(createUserDto.position_id),
    };
    const user = await this.prismaService.user.create({
      data: createUserDtoWithPhoto,
    });
    return {
      success: true,
      user_id: user.id,
      message: 'New user successfully registered',
    };
  }

  async getAllUsers(
    page: number,
    count: number,
  ): Promise<{
    success: boolean;
    page: number;
    total_pages: number;
    total_users: number;
    count: number;
    links: { next_url: string | null; prev_url: string | null };
    users: User[];
  }> {
    const usersPerPage = count;
    const skip = (page - 1) * usersPerPage;

    const [users, totalUsers] = await Promise.all([
      this.prismaService.user.findMany({
        take: usersPerPage,
        skip,
        include: {
          position: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prismaService.user.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / usersPerPage);
    const apiIp = this.configService.get<string>('app.IP');
    const apiPort = this.configService.get<string>('app.PORT');
    const apiPrefix = this.configService.get<string>('app.PREFIX');
    const apiUrl = `${apiIp}:${apiPort}${apiPrefix}`;
    const nextUrl =
      page < totalPages
        ? `${apiUrl}/users?page=${page + 1}&count=${count}`
        : null;
    const prevUrl =
      page > 1 ? `${apiUrl}/users?page=${page - 1}&count=${count}` : null;

    const response: {
      success: boolean;
      page: number;
      total_pages: number;
      total_users: number;
      count: number;
      links: { next_url: string | null; prev_url: string | null };
      users: User[];
    } = {
      success: true,
      page,
      total_pages: totalPages,
      total_users: totalUsers,
      count: users.length,
      links: { next_url: nextUrl, prev_url: prevUrl },
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: user.position.name, // Access position name correctly
        position_id: user.position_id,
        registration_timestamp: user.registration_timestamp,
        photo: user.photo,
      })),
    };

    return response;
  }

  async findOne(id: number): Promise<UserWithPosition | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        position: {
          select: {
            name: true,
          },
        },
      },
    });

    // If user is not found, throw NotFoundException
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'The user with the requested id does not exist',
      });
    }
    const positionName = user.position?.name || ''; // Default to an empty string if position is null

    // Return the user object with position name as string
    return { ...user, position: positionName };
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({ where: { email } });
    return !!user;
  }

  async phoneExists(phone: string): Promise<boolean> {
    // Check if the phone number already exists in the database
    const user = await this.prismaService.user.findFirst({ where: { phone } });
    return !!user;
  }
}
