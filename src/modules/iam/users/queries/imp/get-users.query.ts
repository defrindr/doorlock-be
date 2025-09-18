import { PageOptionsDto } from '@src/shared/paginations';

export class GetUsersQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
