import { PageOptionsDto } from '@src/shared/paginations';

export class GetPermissionsQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
