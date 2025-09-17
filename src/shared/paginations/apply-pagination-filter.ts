import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface QueryOptions {
  alias: string; // table alias for query builder
  allowedSort?: string[];
  allowedSearch?: string[];
  allowedFilter?: string[];
  pageOptions: {
    skip: number;
    take: number;
    sort?: Record<string, 'ASC' | 'DESC'>;
    search?: string;
    filter?: Record<string, string>;
  };
}

export function applyPaginationFilters<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  options: QueryOptions,
) {
  const {
    alias,
    allowedSort = [],
    allowedSearch = [],
    allowedFilter = [],
    pageOptions,
  } = options;

  // --- Pagination ---
  qb.skip(pageOptions.skip).take(pageOptions.take);

  // --- Sorting ---
  if (pageOptions.sort) {
    Object.entries(pageOptions.sort).forEach(([key, value]) => {
      if (allowedSort.includes(key)) {
        qb.addOrderBy(
          `${alias}.${key}`,
          value.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      }
    });
  }

  // --- Global search ---
  if (pageOptions.search && allowedSearch.length) {
    const searchWhere = allowedSearch
      .map((col) => `${alias}.${col} LIKE :search`)
      .join(' OR ');
    qb.andWhere(searchWhere, { search: `%${pageOptions.search}%` });
  }

  // --- Column-specific filters ---
  if (pageOptions.filter) {
    Object.entries(pageOptions.filter).forEach(([key, value]) => {
      if (allowedFilter.includes(key)) {
        qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
      }
    });
  }

  return qb;
}
