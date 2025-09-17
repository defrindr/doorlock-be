import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { User } from '@src/shared/core/decorators/user.decorator';
import { IUser } from '@src/shared/storage/user.storage';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from './command/imp/login.command';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenCommand } from './command/imp/refresh-token.command';
import { GetProfileQuery } from './query/imp/get-profile.query';
import { UserDto } from '../users/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly svc: AuthService,
  ) {}

  @ApiOperation({ summary: 'Mendapatkan token untuk authentication' })
  @Post('login')
  @ApiSingleResponse(LoginResponseDto, 'Login successful')
  @HttpCode(200)
  async login(@Body() payload: LoginDto): Promise<any> {
    return this.commandBus.execute(new LoginCommand(payload));
  }

  @Get('profile')
  @ApiOperation({
    summary: 'get detail current logged in user',
  })
  @HttpCode(200)
  @ApiSingleResponse(UserDto, 'Successful get profile')
  @PermissionAccess()
  @UseInterceptors(ClassSerializerInterceptor)
  async me(@User() user: IUser): Promise<any> {
    return this.queryBus.execute(new GetProfileQuery(user));
  }

  @ApiOperation({ summary: 'Refresh token for authentication' })
  @Post('refresh-token')
  @ApiSingleResponse(LoginResponseDto, 'Refresh token successful')
  @HttpCode(200)
  async refreshToken(@Body() payload: RefreshTokenDto): Promise<any> {
    return this.commandBus.execute(new RefreshTokenCommand(payload));
  }
}
