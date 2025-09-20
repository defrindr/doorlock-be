import { PageOptionsDto } from '@src/shared/paginations';

export class GetGuestsByCompanyQuery {
  constructor(
    public readonly pageOptionsDto: PageOptionsDto,
    public readonly companyId: string,
  ) {}
}
