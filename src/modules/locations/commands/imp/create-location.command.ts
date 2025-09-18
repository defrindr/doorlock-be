import { CreateLocationDto } from '../../dto/create-location.dto';

export class CreateLocationCommand {
  constructor(public readonly createLocationDto: CreateLocationDto) {}
}
