import { PageOptionsDto } from '../dto/page-options.dto';

export interface IPaginationOptions {
  pageOptionsDto: PageOptionsDto;
  allowedSortFields?: string[];
  allowedSearchFields?: string[];
}
