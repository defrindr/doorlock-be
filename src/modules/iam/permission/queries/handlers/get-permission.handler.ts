import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { ResponsePermissionDto } from '../../dto/response-permission.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@src/modules/iam/entities/permission.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { plainToInstance } from 'class-transformer';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { QueryHandler } from '@nestjs/cqrs';
import { GetPermissionQuery } from '../imp/get-permission.query';

@QueryHandler(GetPermissionQuery)
export class GetPermissionHandler extends BaseHandler<
  GetPermissionQuery,
  ApiResponseDto<ResponsePermissionDto>
> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super();
  }

  async handle(
    query: GetPermissionQuery,
  ): Promise<ApiResponseDto<ResponsePermissionDto>> {
    const { id } = query;
    const entity = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!entity) throw new NotFoundHttpException();

    const dto = plainToInstance(ResponsePermissionDto, entity, {
      excludeExtraneousValues: true,
    });

    return OkResponse<ResponsePermissionDto>(dto);
  }
}
