import { ChangePasswordDto } from '../../dto/change-password.dto';

export class ChangePasswordCommand {
  constructor(public readonly payload: ChangePasswordDto) {}
}
