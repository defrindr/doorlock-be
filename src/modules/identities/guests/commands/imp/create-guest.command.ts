import { CreateGuestDto } from '../../dto/create-guest.dto';

export class CreateGuestCommand {
  constructor(public readonly createGuestDto: CreateGuestDto) {}
}
