import { PageOptionsDto } from '@src/shared/paginations';

export class GetVisitsQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
