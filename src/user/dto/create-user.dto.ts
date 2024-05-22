import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { EMAIL_RFC_2822_REGEX, UKRAINIAN_PHONE_REGEX } from '../../constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'The name must be at least 2 characters.' })
  @Length(2, 60, { message: 'The name must be at least 2 characters.' })
  name: string;

  @IsNotEmpty({ message: 'The email must be a valid email address.' })
  @Matches(EMAIL_RFC_2822_REGEX, {
    message: 'The email must be a valid email address.',
  })
  email: string;

  @IsNotEmpty({ message: 'The phone field is required' })
  @Matches(UKRAINIAN_PHONE_REGEX, {
    message: 'The phone number must be a valid Ukrainian phone number.',
  })
  phone: string;

  @IsNumberString({}, { message: 'The position id must be an integer.' })
  position_id: string | number;
}
