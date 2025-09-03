import { SetMetadata } from '@nestjs/common';

export const PermissionAccess = (...permission: string[]) =>
  SetMetadata('permissions', permission);
