import { UpdateGuestDto } from '../../dto/update-guest.dto';

export class UpdateGuestCommand {
  constructor(
    public readonly id: string,
    public readonly updateGuestDto: UpdateGuestDto,
  ) {}
}
