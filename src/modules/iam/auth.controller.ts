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
import { PermissionAccess } from '../../lib/decorators/permission-access.decorator';
import { User } from '../../lib/decorators/user.decorator';
import { IUser } from '../../lib/storage/user.storage';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './users/dto/update-user.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @ApiOperation({ summary: 'Mendapatkan token untuk authentication' })
  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginDto): Promise<any> {
    return await this.svc.login(data);
  }

  @Post('register')
  @HttpCode(200)
  async register(@Body() data: RegisterDto): Promise<any> {
    return await this.svc.register(data);
  }

  @Get('me')
  @HttpCode(200)
  @PermissionAccess()
  @UseInterceptors(ClassSerializerInterceptor)
  async me(@User() user: IUser): Promise<any> {
    return await this.svc.me(user);
  }

  @Post('update')
  @HttpCode(200)
  @PermissionAccess()
  async update(
    @User() user: IUser,
    @Body() payload: UpdateUserDto,
  ): Promise<any> {
    return await this.svc.update(user, payload);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Body() data: RefreshTokenDto): Promise<any> {
    return await this.svc.refreshToken(data);
  }
}
