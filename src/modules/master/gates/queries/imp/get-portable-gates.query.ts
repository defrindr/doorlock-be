import { PageOptionsDto } from '@src/shared/paginations';

export class GetPortableGatesQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
