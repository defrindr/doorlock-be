import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { UpdatePermissionCommand } from './../update-permission.command';
import { CommandHandler } from '@nestjs/cqrs';
import { Not, Repository } from 'typeorm';
import { Permission } from '@src/modules/iam/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { plainToInstance } from 'class-transformer';
import { ResponsePermissionDto } from '../../dto/response-permission.dto';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler extends BaseHandler<
  UpdatePermissionCommand,
  ApiResponseDto<ResponsePermissionDto>
> {
  constructor(
    @InjectRepository(Permission)
    protected readonly repository: Repository<Permission>,
  ) {
    super();
  }

  protected async handle(
    command: UpdatePermissionCommand,
  ): Promise<ApiResponseDto<ResponsePermissionDto>> {
    const { id, payload } = command;
    const [permissionExist, isNotUniqueName] = await Promise.all([
      this.repository.findOne({ where: { id } }),
      payload.name
        ? this.repository.findOne({
            where: { name: payload.name, id: Not(id) },
          })
        : false,
    ]);

    if (!permissionExist) {
      throw new NotFoundHttpException('Permission not found');
    } else if (isNotUniqueName) {
      throw new BadRequestHttpException('The name already used');
    }

    const mergeObj = Object.assign(permissionExist, payload);

    const entity = await this.repository.save(mergeObj);

    const dto = plainToInstance(ResponsePermissionDto, entity, {
      excludeExtraneousValues: true,
    });

    return OkResponse<ResponsePermissionDto>(dto, 'Permission updated');
  }
}
