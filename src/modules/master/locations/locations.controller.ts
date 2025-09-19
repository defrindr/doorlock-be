import {
  Body,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { CreateLocationCommand } from './commands/imp/create-location.command';
import { DeleteLocationCommand } from './commands/imp/delete-location.command';
import { UpdateLocationCommand } from './commands/imp/update-location.command';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationDto } from './dto/location.dto';
import { PageLocationDto } from './dto/page-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { GetLocationQuery } from './queries/imp/get-location.query';
import { GetLocationsQuery } from './queries/imp/get-locations.query';

@ApiTags('Locations')
@Controller({
  path: 'master/locations',
  version: '1',
})
@ApiBearerAuth()
export class LocationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new location',
    description:
      'Create a new location in the system with specified name, type, address, and other location details',
  })
  @ApiSingleResponse(LocationDto, 'Location created successfully', 201)
  @ApiCommonErrors()
  async create(
    @Body() createLocationDto: CreateLocationDto,
  ): Promise<ApiResponseDto<LocationDto>> {
    return this.commandBus.execute(
      new CreateLocationCommand(createLocationDto),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all locations with pagination',
    description:
      'Retrieve a paginated list of all locations in the system with optional search functionality by name or address',
  })
  @ApiSingleResponse(LocationDto, 'Locations retrieved successfully', 200)
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') search?: string,
  ): Promise<ApiResponseDto<PageLocationDto>> {
    return this.queryBus.execute(new GetLocationsQuery(pageOptionsDto, search));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get location by ID',
    description:
      'Retrieve detailed information of a specific location using its unique identifier including associated gates',
  })
  @ApiSingleResponse(LocationDto, 'Location retrieved successfully', 200)
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<LocationDto>> {
    return this.queryBus.execute(new GetLocationQuery(id));
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update location by ID',
    description:
      'Update existing location information including name, type, address, and other location-related details',
  })
  @ApiSingleResponse(LocationDto, 'Location updated successfully', 200)
  @ApiCommonErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ): Promise<ApiResponseDto<LocationDto>> {
    return this.commandBus.execute(
      new UpdateLocationCommand(id, updateLocationDto),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete location by ID',
    description:
      'Permanently remove a location from the system. This will also affect all associated gates and access configurations',
  })
  @ApiOkResponse({
    description: 'Location deleted successfully',
    type: ApiResponseDto,
  })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<boolean>> {
    return this.commandBus.execute(new DeleteLocationCommand(id));
  }
}
