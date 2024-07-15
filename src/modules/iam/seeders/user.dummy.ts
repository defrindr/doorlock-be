import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';

export const UserDummies: User[] = [
  {
    id: '0000-0000-0000-0001',
    username: 'defrindr',
    password: 'testing',
    name: 'Defri Indra Mahardika',
    roleId: '1111-1111-1111-1111',
  },
];
