import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserStorage } from '../storage/user.storage';
import { log } from 'console';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public permission: string;

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.

    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!permissions) {
      return true;
    }

    this.permission = permissions[0];

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    log(info);
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    if (this.permission && !user.permissions.includes(this.permission)) {
      throw new ForbiddenException(
        `Forbidden to access ${this.permission} resource`,
      );
    }

    UserStorage.set(user);

    return user;
  }
}
