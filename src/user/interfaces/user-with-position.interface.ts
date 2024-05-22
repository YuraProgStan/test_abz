import { User } from '@prisma/client';

export interface UserWithPosition extends User {
  position: string;
}
