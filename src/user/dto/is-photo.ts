import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsPhoto(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhoto',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any) {
          if (!value) {
            return false; // Value is empty, so it fails validation
          }

          const file = value;

          // Check file format (must be jpeg/jpg)
          const allowedFormats = ['image/jpeg', 'image/jpg'];
          if (!allowedFormats.includes(file.mimetype)) {
            return false;
          }

          // Check file size (must not be greater than 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
          if (file.size > maxSize) {
            return false;
          }
          return true;
        },
        defaultMessage() {
          return 'The photo may not be greater than 5 Mbytes.';
        },
      },
    });
  };
}
