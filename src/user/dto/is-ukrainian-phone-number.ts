import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsUkrainianPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUkrainianPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          const regex = /^[+]{0,1}380([0-9]{9})$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage() {
          return 'Phone number must start with +380 and contain exactly 12 digits in total';
        },
      },
    });
  };
}
