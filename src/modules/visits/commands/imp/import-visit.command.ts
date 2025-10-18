import { ImportVisitDto } from '../../dto/import-visit.dto';

export class ImportVisitCommand {
  constructor(public readonly importVisitDto: ImportVisitDto) {}
}
