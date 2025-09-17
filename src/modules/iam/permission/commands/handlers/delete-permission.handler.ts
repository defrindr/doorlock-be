import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@src/modules/iam/entities/permission.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { Repository } from 'typeorm';
import { DeletePermissionCommand } from '../delete-permission.command';

@CommandHandler(DeletePermissionCommand)
export class DeletePermissionHandler extends BaseHandler<
  DeletePermissionCommand,
  ApiResponseDto<any>
> {
  constructor(
    @InjectRepository(Permission)
    protected readonly repository: Repository<Permission>,
  ) {
    super();
  }

  protected async handle(
    command: DeletePermissionCommand,
  ): Promise<ApiResponseDto<any>> {
    const { id } = command;

    const permission = await this.repository.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundHttpException(`Permission with ID ${id} not found`);
    }

    await this.repository.remove(permission);

    return OkResponse<any>({}, 'Permission successful delete');
  }
}
