import { CreateViolationDto } from '../../dto/create-violation.dto';

export class CreateViolationCommand {
  constructor(public readonly createViolationDto: CreateViolationDto) {}
}
