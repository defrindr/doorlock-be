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

const getColumnName = (columnName: string, defaultAlias: string) => {
  return columnName.includes('.')
    ? columnName
    : `${defaultAlias}.${columnName}`;
};

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
          getColumnName(key, alias),
          value.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        );
      }
    });
  }

  // --- Global search ---
  if (pageOptions.search && allowedSearch.length) {
    const searchWhere = allowedSearch
      .map((col) => `${getColumnName(col, alias)} LIKE :search`)
      .join(' OR ');
    qb.andWhere(searchWhere, { search: `%${pageOptions.search}%` });
  }

  // --- Column-specific filters ---
  if (pageOptions.filter) {
    Object.entries(pageOptions.filter).forEach(([key, value]) => {
      if (allowedFilter.includes(key)) {
        qb.andWhere(`${getColumnName(key, alias)} = :${key}`, { [key]: value });
      }
    });
  }

  return qb;
}
