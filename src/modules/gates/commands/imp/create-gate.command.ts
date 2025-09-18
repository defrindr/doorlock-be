import { CreateGateDto } from '../../dto/create-gate.dto';

export class CreateGateCommand {
  constructor(public readonly createGateDto: CreateGateDto) {}
}
