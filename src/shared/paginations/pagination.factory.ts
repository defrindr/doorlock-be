import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PageMetaDto } from './dto/page-meta.dto';
import { PageDto } from './dto/page.dto';
import { IPaginationOptions } from './interfaces/pagination-options.interface';

export class PaginationFactory<T extends ObjectLiteral> {
  private readonly queryBuilder: SelectQueryBuilder<T>;
  private readonly options: IPaginationOptions;

  constructor(
    queryBuilder: SelectQueryBuilder<T>,
    options: IPaginationOptions,
  ) {
    this.queryBuilder = queryBuilder;
    this.options = options;
  }

  public async createPage(): Promise<PageDto<T>> {
    this.applyPagination();
    this.applySorting();
    this.applySearching();

    const itemCount = await this.queryBuilder.getCount();
    const { entities } = await this.queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: this.options.pageOptionsDto,
    });

    return new PageDto(entities, pageMetaDto);
  }

  private applyPagination(): void {
    const { skip, take } = this.options.pageOptionsDto;
    this.queryBuilder.skip(skip).take(take);
  }

  private applySorting(): void {
    const { sort } = this.options.pageOptionsDto;
    const allowedSortFields = this.options.allowedSortFields ?? [];

    if (sort) {
      for (const [key, value] of Object.entries(sort)) {
        if (allowedSortFields.includes(key)) {
          // Asumsi alias tabel utama adalah nama entity
          const alias = this.queryBuilder.alias;
          this.queryBuilder.addOrderBy(`${alias}.${key}`, value);
        }
      }
    }
  }

  private applySearching(): void {
    const { search } = this.options.pageOptionsDto;
    const allowedSearchFields = this.options.allowedSearchFields ?? [];

    if (search && allowedSearchFields.length > 0) {
      this.queryBuilder.andWhere(
        new Brackets((qb) => {
          for (const key of allowedSearchFields) {
            const alias = this.queryBuilder.alias;
            // ILIKE lebih cocok untuk case-insensitive search di PostgreSQL
            qb.orWhere(`${alias}.${key} ILIKE :search`, {
              search: `%${search}%`,
            });
          }
        }),
      );
    }
  }
}
