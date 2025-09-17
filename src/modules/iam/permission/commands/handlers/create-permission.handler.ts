import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@src/modules/iam/entities/permission.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { ResponsePermissionDto } from '../../dto/response-permission.dto';
import { CreatePermissionCommand } from './../create-permission.command';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { CommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler extends BaseHandler<
  CreatePermissionCommand,
  ApiResponseDto<ResponsePermissionDto>
> {
  constructor(
    @InjectRepository(Permission)
    protected readonly permissionRepository: Repository<Permission>,
  ) {
    super();
  }

  async handle(
    command: CreatePermissionCommand,
  ): Promise<ApiResponseDto<ResponsePermissionDto>> {
    const { payload } = command;

    // Check if permission name exists
    const permissionExisting = await this.permissionRepository.findOne({
      where: {
        name: payload.name,
      },
    });

    if (permissionExisting)
      throw new BadRequestHttpException('Name already exist');

    const entity = await this.permissionRepository.save(payload);

    const dto = plainToInstance(ResponsePermissionDto, entity, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse<ResponsePermissionDto>(dto);
  }
}
