import { Brackets, SelectQueryBuilder } from 'typeorm';
import { PageMetaDto } from './page-meta.dto';
import { PageOptionsDto } from './page-options.dto';
import { PageDto } from './page.dto';
import { log } from 'console';

export const PrepareDataProvider = async (
  queryBuilder: SelectQueryBuilder<any>,
  pageOptionsDto: PageOptionsDto,
  allowedSortFields: any[] = [],
  allowedSearchFields: any[] = [],
  callback: any = null,
): Promise<PageDto<any>> => {
  // limit and offset
  queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

  // sorting
  if (pageOptionsDto.sort) {
    for (const [key, value] of Object.entries(pageOptionsDto.sort)) {
      if (allowedSortFields.includes(key)) {
        console.log(pageOptionsDto.sort);
        queryBuilder.addOrderBy(`"${key}"`, value);
      }
    }
  }

  // dynamic search
  if (pageOptionsDto.search && allowedSearchFields.length > 0) {
    queryBuilder.andWhere(
      new Brackets((qb) => {
        const value = pageOptionsDto.search;
        for (let i = 0; i < allowedSearchFields.length; i++) {
          const key = allowedSearchFields[i];
          let keyDb = key;

          if (keyDb.includes('.')) {
            keyDb = keyDb
              .split('.')
              // ! if u use pqsql, u need add double quote
              .map((item: any) => `${item}`)
              .join('.');
          } else {
            // ! if u use pqsql, u need add double quote
            keyDb = `${keyDb}`;
          }

          qb.orWhere(`${keyDb} LIKE LOWER(:val)`, { val: `%${value}%` });
        }
      }),
    );
  }

  log(queryBuilder.getQuery());

  const itemCount = await queryBuilder.getCount();
  let { entities } = await queryBuilder.getRawAndEntities();

  if (callback) {
    entities = await callback(entities);
  }

  const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

  return new PageDto(entities, pageMetaDto);
};
