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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Create new User',
    description:
      'Creates a new user account with provided credentials and profile information. The user will be created with default active status and assigned basic permissions.',
  })
  @ApiSingleResponse(UserDto, 'Data berhasil ditambahkan', 201)
  @ApiCommonErrors()
  create(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @Get('')
  @ApiOperation({
    summary: 'Fetch all Users with pagination',
    description:
      'Retrieves a paginated list of all users in the system. Supports filtering, sorting, and searching capabilities through query parameters.',
  })
  @ApiExtraModels(PageUserDto)
  @ApiPaginatedResponse(PageUserDto)
  @ApiCommonErrors()
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.queryBus.execute(new GetUsersQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find specific user',
    description:
      'Retrieves detailed information about a specific user by their unique identifier. Returns complete user profile including roles and permissions.',
  })
  @ApiSingleResponse(UserDto, 'Data berhasil didapatkan', 200)
  @ApiCommonErrors()
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update existing User',
    description:
      'Updates an existing user account with new information. Supports partial updates - only provided fields will be modified while preserving existing data.',
  })
  @ApiSingleResponse(UserDto, 'Data berhasil diubah', 200)
  @ApiCommonErrors()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, updateUserDto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete User',
    description:
      'Permanently removes a user account from the system. This action cannot be undone. All associated data and permissions will be revoked.',
  })
  @ApiOkResponse({ description: 'Data berhasil dihapus', type: ApiResponseDto })
  @ApiCommonErrors()
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
