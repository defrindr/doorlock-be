import { IUser } from '@src/shared/storage/user.storage';

export class GetProfileQuery {
  constructor(public readonly user: IUser) {}
}
