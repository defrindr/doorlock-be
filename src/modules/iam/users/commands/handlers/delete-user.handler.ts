import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { Repository } from 'typeorm';
import { DeleteUserCommand } from '../imp/delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler extends BaseHandler<
  DeleteUserCommand,
  ApiResponseDto<any>
> {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async handle(command: DeleteUserCommand): Promise<ApiResponseDto<any>> {
    const { id } = command;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundHttpException('User not found');
    }

    await this.userRepository.remove(user);
    return OkResponse<any>(null, 'User deleted');
  }
}
