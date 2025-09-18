import { UpdateLocationDto } from '../../dto/update-location.dto';

export class UpdateLocationCommand {
  constructor(
    public readonly id: string,
    public readonly updateLocationDto: UpdateLocationDto,
  ) {}
}
