// backend/src/modules/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../dto/register.dto';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
