import { PageOptionsDto } from '@src/shared/paginations';

export class GetCompaniesQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
