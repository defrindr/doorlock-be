import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { UserStorage } from '@src/shared/storage/user.storage';
import { Repository } from 'typeorm';
import { AuthService } from '../../auth.service';
import { ChangePasswordCommand } from '../imp/change-password.command';
import {
  BadRequestHttpException,
  ForbiddenHttpException,
} from '@src/shared/core/exceptions/exception';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler extends BaseHandler<
  ChangePasswordCommand,
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
    command: ChangePasswordCommand,
  ): Promise<ApiResponseDto<any>> {
    const { currentPassword, newPassword, confirmPassword } = command.payload;
    const currentAuth = UserStorage.get();
    if (!currentAuth) throw new BadRequestHttpException();
    const user = await this.userRepository.findOne({
      where: { id: currentAuth.sub },
      relations: ['role'],
    });

    if (!user) {
      throw new ForbiddenHttpException();
    }

    const passwordCorrect = this.authService.validatePassword(
      currentPassword,
      user.password,
    );
    if (!passwordCorrect) {
      throw new BadRequestHttpException("Password isn't correct");
    } else if (newPassword !== confirmPassword) {
      throw new BadRequestHttpException(
        'New password not matched confirm password',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(
      {
        id: currentAuth.sub,
      },
      {
        password: hashedPassword,
      },
    );

    const userDto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    return OkResponse(userDto, 'Change Password successfully');
  }
}
