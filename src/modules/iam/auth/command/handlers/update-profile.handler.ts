import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { UserStorage } from '@src/shared/storage/user.storage';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { UpdateProfileCommand } from '../imp/update-profile.command';
import { ForbiddenHttpException } from '@src/shared/core/exceptions/exception';
import { Injectable } from '@nestjs/common';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';
import { AuthService } from '../../auth.service';

@CommandHandler(UpdateProfileCommand)
@Injectable()
export class UpdateProfileHandler extends BaseHandler<
  UpdateProfileCommand,
  ApiResponseDto<any>
> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {
    super();
  }

  protected async handle(
    command: UpdateProfileCommand,
  ): Promise<ApiResponseDto<UserDto>> {
    const { username, name, email } = command.payload;

    const currentAuth = await UserStorage.get();
    if (!currentAuth) {
      throw new ForbiddenHttpException('Unauthed user');
    }

    await this.userRepository.update(
      { id: currentAuth.sub },
      {
        username,
        email,
        name,
      },
    );

    const user = await this.userRepository.findOne({
      where: { id: currentAuth.sub },
      relations: ['role'],
    });
    if (!user) {
      throw new ForbiddenHttpException('Unauthed user');
    }
    const authContext = await this.authService.getAuthorizationContext(user!);

    const userDto = plainToInstance(
      UserDto,
      { ...user, permissions: authContext.permissions },
      {
        excludeExtraneousValues: true,
      },
    );

    return OkResponse(userDto, 'Update profile successfully');
  }
}
