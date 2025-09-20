import { CreateVisitDto } from '../../dto/create-visit.dto';

export class CreateVisitCommand {
  constructor(public readonly createVisitDto: CreateVisitDto) {}
}
