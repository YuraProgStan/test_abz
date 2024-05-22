import {
  Controller,
  Get,
  Post,
  Param,
  HttpStatus,
  Query,
  HttpException,
  Body,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { getImageSize } from '../utils/get-image-size';
import { CustomParseFilePipe } from '../pipes/custom-parse-file.pipe';
import {
  ALLOWED_FILE_TYPES,
  IMAGE_DIMENSION,
  MAX_FILE_SIZE,
} from '../constants';
import { UserInterface } from './interfaces/user.interface';
import { TokenValidationInterceptor } from './interceptors/token-validation-interceptor';
import { OptionalIntPipe } from '../pipes/optional-int.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UseInterceptors(TokenValidationInterceptor, FileInterceptor('photo'))
  async create(
    @UploadedFile(
      new CustomParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }), // 5 MB limit
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }), // Allowed file types
        ],
      }),
    )
    photo: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    if (!photo) {
      throw new BadRequestException('Photo is required.');
    }

    try {
      const { width, height } = await getImageSize(photo.buffer);

      if (width < IMAGE_DIMENSION || height < IMAGE_DIMENSION) {
        throw new BadRequestException(
          `Minimum size of photo is ${IMAGE_DIMENSION}x${IMAGE_DIMENSION}px.`,
        );
      }

      return this.userService.create(createUserDto, photo);
    } catch (error) {
      throw new BadRequestException(error.message || 'Invalid image file.');
    }
  }

  @Get()
  async getAllUsers(
    @Query('page', OptionalIntPipe) page: number = 1,
    @Query('count', OptionalIntPipe) count: number = 6,
  ): Promise<{
    success: boolean;
    page: number;
    total_pages: number;
    total_users: number;
    count: number;
    links: { next_url: string | null; prev_url: string | null };
    users: UserInterface[];
  }> {
    return this.userService.getAllUsers(Number(page), Number(count));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new HttpException(
        {
          success: false,
          message: 'The user with the requested id does not exist',
          fails: {
            userId: ['The user must be an integer.'],
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.userService.findOne(userId);
  }
}
