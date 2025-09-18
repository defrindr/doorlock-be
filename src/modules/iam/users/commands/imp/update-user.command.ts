import { UpdateUserDto } from '../../dto/update-user.dto';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly payload: UpdateUserDto,
  ) {}
}
