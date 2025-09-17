// user.storage.ts
/**
 * https://medium.com/@sascha.wolff/advanced-nestjs-how-to-have-access-to-the-current-user-in-every-service-without-request-scope-2586665741f
 * Related article why we user async storage
 */
import { AsyncLocalStorage } from 'async_hooks';

export interface IUser {
  sub: string;
  roles: string[] | string;
  permissions: string[] | string;
}

export const UserStorage = {
  storage: new AsyncLocalStorage<IUser>(),
  get() {
    return this.storage.getStore();
  },
  set(user: IUser) {
    return this.storage.enterWith(user);
  },
};
