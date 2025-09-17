import { UpdateRoleDto } from '../../dto/update-role.dto';

export class UpdateRoleCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateRoleDto,
  ) {}
}
