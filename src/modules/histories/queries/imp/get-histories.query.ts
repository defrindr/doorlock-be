import { PageOptionsDto } from '@src/shared/paginations';

export class GetHistoriesQuery {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto & {
      timestamp?: { start: string; end: string };
    },
  ) {}
}
