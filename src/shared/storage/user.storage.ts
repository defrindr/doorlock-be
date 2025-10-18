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
  get(): IUser | undefined {
    return this.storage.getStore()?.user;
  },

  set(user: IUser) {
    const store = this.storage.getStore();
    if (store) {
      store.user = user; // ← isi context aktif
    } else {
      // fallback kalau belum ada context (harusnya jarang kejadian)
      this.storage.run({ user }, () => {});
    }
  },
};
