import { PageOptionsDto } from '@src/shared/utils/paginations';

export class GetPermissionsQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
