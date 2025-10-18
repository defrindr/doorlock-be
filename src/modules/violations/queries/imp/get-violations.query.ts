import { PageOptionsDto } from '@src/shared/paginations';

export class GetViolationsQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
