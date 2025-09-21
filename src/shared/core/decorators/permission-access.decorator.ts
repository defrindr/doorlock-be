import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export const PermissionAccess = (...permissions: string[]) => {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    ApiBearerAuth(), // automatically add Swagger Bearer Auth
  );
};
