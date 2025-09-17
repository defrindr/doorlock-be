import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { GetProfileQuery } from '../imp/get-profile.query';
import { QueryHandler } from '@nestjs/cqrs';
import { AuthService } from '../../auth.service';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';
import { plainToInstance } from 'class-transformer';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler extends BaseHandler<GetProfileQuery, any> {
  constructor(private readonly authService: AuthService) {
    super();
  }

  protected async handle(command: GetProfileQuery): Promise<any> {
    const user = await this.authService.getUserById(command.user.sub);
    const dto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    return OkResponse<UserDto>(dto, 'Successful get profile');
  }
}
