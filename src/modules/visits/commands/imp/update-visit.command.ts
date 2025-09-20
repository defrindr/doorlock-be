import { UpdateVisitDto } from '../../dto/update-visit.dto';

export class UpdateVisitCommand {
  constructor(
    public readonly id: string,
    public readonly updateVisitDto: UpdateVisitDto,
  ) {}
}
