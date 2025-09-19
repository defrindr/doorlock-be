import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { MultipartForm } from '@src/shared/core/decorators/multipart-form.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateGuestCommand } from './commands/imp/create-guest.command';
import { DeleteGuestCommand } from './commands/imp/delete-guest.command';
import { UpdateGuestCommand } from './commands/imp/update-guest.command';
import { CreateGuestDto } from './dto/create-guest.dto';
import { GuestDto } from './dto/guest.dto';
import { PageGuestDto } from './dto/page-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GetGuestQuery } from './queries/imp/get-guest.query';
import { GetGuestsQuery } from './queries/imp/get-guests.query';

@Controller('identities/guests')
@ApiTags('Guests')
@ApiBearerAuth()
export class GuestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new guest',
    description:
      'Create a new guest identity with personal information, company association, and photo upload. Supports multipart form data for file uploads.',
  })
  @ApiSingleResponse(GuestDto, 'Guest created successfully')
  @ApiCommonErrors()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateGuestDto,
    description: 'Guest creation data with photo upload',
  })
  async create(
    @MultipartForm(CreateGuestDto) createGuestDto: CreateGuestDto,
  ): Promise<ApiResponseDto<GuestDto>> {
    return this.commandBus.execute(new CreateGuestCommand(createGuestDto));
  }

  @Get()
  @ApiOperation({
    summary: 'Get all guests with pagination',
    description:
      'Retrieve a paginated list of all guest identities in the system with their associated company and contact information',
  })
  @ApiOkResponse({
    description: 'Guests retrieved successfully',
    type: PageGuestDto,
  })
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageGuestDto> {
    return this.queryBus.execute(new GetGuestsQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get guest by ID',
    description:
      'Retrieve detailed information of a specific guest including personal data, company association, and identification details',
  })
  @ApiSingleResponse(GuestDto, 'Guest retrieved successfully')
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<GuestDto>> {
    return this.queryBus.execute(new GetGuestQuery(id));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update guest by ID',
    description:
      'Update existing guest information including personal details, company association, contact information, and identification data',
  })
  @ApiSingleResponse(GuestDto, 'Guest updated successfully')
  @ApiCommonErrors()
  @ApiBody({
    type: UpdateGuestDto,
    description: 'Guest update data with photo upload',
  })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @MultipartForm(UpdateGuestDto) updateGuestDto: UpdateGuestDto,
  ): Promise<ApiResponseDto<GuestDto>> {
    return this.commandBus.execute(new UpdateGuestCommand(id, updateGuestDto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete guest by ID',
    description:
      'Permanently remove a guest from the system. This will also remove all associated access logs and identification records',
  })
  @ApiOkResponse({ description: 'Data berhasil dihapus', type: ApiResponseDto })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new DeleteGuestCommand(id));
  }
}
