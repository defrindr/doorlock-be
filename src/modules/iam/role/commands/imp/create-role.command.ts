import { CreateRoleDto } from '../../dto/create-role.dto';

export class CreateRoleCommand {
  constructor(public readonly payload: CreateRoleDto) {}
}
