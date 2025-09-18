import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { UserDto } from '../../dto/user.dto';
import { GetUserQuery } from '../imp/get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler extends BaseHandler<
  GetUserQuery,
  ApiResponseDto<UserDto>
> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async handle(query: GetUserQuery): Promise<ApiResponseDto<UserDto>> {
    const { id } = query;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundHttpException('User not found');
    }

    const dto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    return OkResponse<UserDto>(dto, 'User found');
  }
}
