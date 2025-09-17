import { PageOptionsDto } from '@src/shared/paginations';

export class GetRolesQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
