import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@src/modules/iam/entities/role.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { Repository } from 'typeorm';
import { DeleteRoleCommand } from '../imp/delete-role.command';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler extends BaseHandler<
  DeleteRoleCommand,
  ApiResponseDto<any>
> {
  constructor(
    @InjectRepository(Role)
    protected readonly roleRepository: Repository<Role>,
  ) {
    super();
  }

  async handle(command: DeleteRoleCommand): Promise<ApiResponseDto<any>> {
    const { id } = command;

    const data = await this.roleRepository.findOne({
      where: { id },
    });

    if (!data) {
      throw new NotFoundHttpException('Role not found');
    }

    try {
      await this.roleRepository.remove(data);
      return OkResponse<any>(null, 'Role deleted');
    } catch (error) {
      throw error;
    }
  }
}
