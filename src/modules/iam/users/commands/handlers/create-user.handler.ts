import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { UserDto } from '../../dto/user.dto';
import { CreateUserCommand } from '../imp/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler extends BaseHandler<
  CreateUserCommand,
  ApiResponseDto<UserDto>
> {
  constructor(
    @InjectRepository(User)
    protected readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async handle(command: CreateUserCommand): Promise<ApiResponseDto<UserDto>> {
    const { payload } = command;

    // Check if username exists
    const userExisting = await this.userRepository.findOne({
      where: {
        username: payload.username,
      },
    });

    if (userExisting) {
      throw new BadRequestHttpException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    // Create user with default status if not provided
    const userData = {
      ...payload,
      password: hashedPassword,
      status: payload.status || 'active',
    };

    const entity = await this.userRepository.save(userData);

    const dto = plainToInstance(UserDto, entity, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse<UserDto>(dto);
  }
}
