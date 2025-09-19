import { PageOptionsDto } from '@src/shared/paginations';

export class GetGuestsQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
