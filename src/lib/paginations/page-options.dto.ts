import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ISort, Order, getSort } from './constants';

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

  @ApiPropertyOptional({
    example: 'admin',
  })
  @Type(() => String)
  @IsOptional()
  readonly search?: string = '';

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.take ?? 20);
  }
}
