import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ISort, getSort } from '../helpers/sort.helper';
import { Order } from '../enums/order.enum';

export class PageOptionsDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 500,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  readonly take: number = 20;

  @ApiPropertyOptional({
    example: {
      id: Order.DESC,
      name: Order.ASC,
    },
  })
  @Type(() => Object)
  @IsOptional()
  @Transform(({ value }) => getSort(value))
  readonly sort?: ISort;

  @ApiPropertyOptional({ example: 'admin', description: 'Global search' })
  @IsOptional()
  @IsString()
  readonly search?: string = '';

  @ApiPropertyOptional({
    description: 'Column filters, e.g. filter[name]=admin',
  })
  @IsOptional()
  @Transform(({ value }) => value || {}) // ensure object
  readonly filter?: Record<string, string>;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.take ?? 20);
  }
}
