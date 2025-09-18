import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UserDto } from '../../dto/user.dto';
import { UpdateUserCommand } from '../imp/update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler extends BaseHandler<
  UpdateUserCommand,
  ApiResponseDto<UserDto>
> {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async handle(command: UpdateUserCommand): Promise<ApiResponseDto<UserDto>> {
    const { id, payload } = command;

    const existingUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundHttpException('User not found');
    }

    // Hash password if provided
    const updateData = { ...payload };
    if (payload.password) {
      updateData.password = await argon2.hash(payload.password);
    }

    const updatedUser = await this.userRepository.save({
      ...existingUser,
      ...updateData,
    });

    const dto = plainToInstance(UserDto, updatedUser, {
      excludeExtraneousValues: true,
    });

    return OkResponse<UserDto>(dto, 'User updated');
  }
}
