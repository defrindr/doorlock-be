/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserStorage } from '@src/shared/storage/user.storage';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if ApiBearerAuth exists on handler or controller
    // const handler = context.getHandler();
    // const controller = context.getClass();

    // // --- Get all metadata keys on controller ---
    // const classKeys = Reflect.getMetadataKeys(controller);
    // const classMetadata = classKeys.reduce(
    //   (acc, key) => {
    //     acc[key] = Reflect.getMetadata(key, controller);
    //     return acc;
    //   },
    //   {} as Record<string, any>,
    // );
    // console.log('Class metadata:', classMetadata);

    const hasBearerAuth = this.reflector.getAllAndOverride<boolean>(
      'swagger/apiSecurity',
      [context.getHandler(), context.getClass()],
    );
    const hasPermission = this.reflector.getAllAndOverride<boolean>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!hasBearerAuth && !hasPermission) {
      return true;
    }

    const permissions =
      this.reflector.get<string[]>('permissions', context.getHandler()) ||
      this.reflector.get<string[]>('permissions', context.getClass());

    const request = context.switchToHttp().getRequest();
    request._requiredPermissions = permissions;

    // Run JWT authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const requiredPermissions = user?.request?._requiredPermissions;
    if (
      requiredPermissions?.length &&
      !requiredPermissions.every((p: any) => user.permissions.includes(p))
    ) {
      throw new ForbiddenException(
        `Forbidden to access ${requiredPermissions.join(', ')} resource`,
      );
    }

    UserStorage.set(user);
    return user;
  }
}
