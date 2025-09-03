import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { PageOptionsDto } from '@src/shared/utils/paginations';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  @PermissionAccess('iam.user.create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  @PermissionAccess('iam.user.index')
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return await this.usersService.findAll(pageOptionsDto);
  }

  @Get('search/:type')
  async findOpd(
    @Query() pageOptionsDto: PageOptionsDto,
    @Param('type', new ParseIntPipe()) type: number,
  ) {
    return await this.usersService.findSpecific(pageOptionsDto, type);
  }

  @Get(':id')
  @PermissionAccess('iam.user.view')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @PermissionAccess('iam.user.view')
  update(@Param('id') id: string, @Body() payload: any) {
    return this.usersService.update(id, payload);
  }

  @Delete(':id')
  @PermissionAccess('iam.user.delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
