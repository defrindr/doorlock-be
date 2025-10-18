// src/shared/middleware/user-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { IUser, UserStorage } from '@src/shared/storage/user.storage';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    // Jalankan setiap request dalam satu AsyncLocalStorage context
    UserStorage.storage.run({} as IUser, () => {
      next();
    });
  }
}
