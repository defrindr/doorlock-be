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
import { CreateCompanyCommand } from './commands/imp/create-company.command';
import { DeleteCompanyCommand } from './commands/imp/delete-company.command';
import { UpdateCompanyCommand } from './commands/imp/update-company.command';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyDto } from './dto/company.dto';
import { PageCompanyDto } from './dto/page-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { GetCompanyQuery } from './queries/imp/get-company.query';
import { GetCompaniesQuery } from './queries/imp/get-companies.query';

@Controller('companies')
@ApiTags('companies')
@ApiBearerAuth()
export class CompaniesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiSingleResponse(CompanyDto, 'Company created successfully')
  @ApiCommonErrors()
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<ApiResponseDto<CompanyDto>> {
    return this.commandBus.execute(new CreateCompanyCommand(createCompanyDto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiOkResponse({
    description: 'Companies retrieved successfully',
    type: PageCompanyDto,
  })
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageCompanyDto> {
    return this.queryBus.execute(new GetCompaniesQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiSingleResponse(CompanyDto, 'Company retrieved successfully')
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<CompanyDto>> {
    return this.queryBus.execute(new GetCompanyQuery(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiSingleResponse(CompanyDto, 'Company updated successfully')
  @ApiCommonErrors()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<ApiResponseDto<CompanyDto>> {
    return this.commandBus.execute(
      new UpdateCompanyCommand(id, updateCompanyDto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company by ID' })
  @ApiOkResponse({
    description: 'Company deleted successfully',
    type: String,
  })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new DeleteCompanyCommand(id));
  }
}
