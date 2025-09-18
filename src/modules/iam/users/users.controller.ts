import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiPaginatedResponse } from '@src/shared/core/decorators/api-paginated-response.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateUserCommand } from './commands/imp/create-user.command';
import { DeleteUserCommand } from './commands/imp/delete-user.command';
import { UpdateUserCommand } from './commands/imp/update-user.command';
import { CreateUserDto } from './dto/create-user.dto';
import { PageUserDto } from './dto/page-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { GetUserQuery } from './queries/imp/get-user.query';
import { GetUsersQuery } from './queries/imp/get-users.query';

@ApiTags('Users')
@Controller('iam/users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('')
  @ApiSingleResponse(UserDto, 'Data berhasil ditambahkan', 201)
  @ApiCommonErrors()
  create(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @Get('')
  @ApiPaginatedResponse(PageUserDto)
  @ApiCommonErrors()
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.queryBus.execute(new GetUsersQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiSingleResponse(UserDto, 'Data berhasil didapatkan', 200)
  @ApiCommonErrors()
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Put(':id')
  @ApiSingleResponse(UserDto, 'Data berhasil diubah', 200)
  @ApiCommonErrors()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, updateUserDto));
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Data berhasil dihapus', type: ApiResponseDto })
  @ApiCommonErrors()
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
