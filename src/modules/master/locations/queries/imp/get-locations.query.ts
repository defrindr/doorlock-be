import { PageOptionsDto } from '@src/shared/paginations';

export class GetLocationsQuery {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto,
    public readonly search?: string,
  ) {}
}
