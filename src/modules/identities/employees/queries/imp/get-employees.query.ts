import { PageOptionsDto } from '@src/shared/paginations';

export class GetEmployeesQuery {
  constructor(public readonly pageOptionsDto: PageOptionsDto) {}
}
