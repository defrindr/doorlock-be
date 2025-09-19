import { PageOptionsDto } from '@src/shared/paginations';

export class GetGatesQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
