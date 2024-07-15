import { Role } from '../role/entities/role.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from '../users/entities/user.entity';

export const RoleDummies: Role[] = [
  {
    id: '1111-1111-1111-1111',
    name: 'Administrator',
  },
  {
    id: '1111-1111-1111-1112',
    name: 'Operator',
  },
];
