import { UpdateGateDto } from '../../dto/update-gate.dto';

export class UpdateGateCommand {
  constructor(
    public readonly id: string,
    public readonly updateGateDto: UpdateGateDto,
  ) {}
}
