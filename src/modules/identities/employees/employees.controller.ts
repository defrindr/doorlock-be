import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreateEmployeeCommand } from './commands/imp/create-employee.command';
import { DeleteEmployeeCommand } from './commands/imp/delete-employee.command';
import { UpdateEmployeeCommand } from './commands/imp/update-employee.command';
import { BulkInsertEmployeeCommand } from './commands/imp/bulk-insert-employee.command';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { BulkInsertEmployeeDto } from './dto/bulk-insert-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { PageEmployeeDto } from './dto/page-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkInsertResultDto } from './dto/bulk-insert-result.dto';
import { GetEmployeeQuery } from './queries/imp/get-employee.query';
import { GetEmployeesQuery } from './queries/imp/get-employees.query';

@Controller('identities/employees')
@ApiTags('Employees')
@ApiBearerAuth()
export class EmployeesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new employee',
    description:
      'Create a new employee identity with personal information, job details, and photo upload. Supports multipart form data for file uploads.',
  })
  @ApiSingleResponse(EmployeeDto, 'Employee created successfully', 201)
  @ApiCommonErrors()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateEmployeeDto,
    description: 'Employee creation data with photo upload',
  })
  async create(
    @MultipartForm(CreateEmployeeDto) createEmployeeDto: CreateEmployeeDto,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    return this.commandBus.execute(
      new CreateEmployeeCommand(createEmployeeDto),
    );
  }

  @Post('bulk-insert')
  @ApiOperation({
    summary: 'Bulk insert employees',
    description: 'Bulk insert employees with excel file',
  })
  @ApiOkResponse({
    description: 'Employees bulk inserted successfully',
    type: BulkInsertResultDto,
  })
  @ApiCommonErrors()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: BulkInsertEmployeeDto,
    description: 'Excel file for bulk employee insertion',
  })
  async bulkInsert(
    @MultipartForm(BulkInsertEmployeeDto)
    bulkInsertEmployeeDto: BulkInsertEmployeeDto,
  ): Promise<ApiResponseDto<BulkInsertResultDto>> {
    return this.commandBus.execute(
      new BulkInsertEmployeeCommand(bulkInsertEmployeeDto),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all employees with pagination',
    description:
      'Retrieve a paginated list of all employee identities in the system with their associated job and contact information',
  })
  @ApiOkResponse({
    description: 'Employees retrieved successfully',
    type: PageEmployeeDto,
  })
  @ApiCommonErrors()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<ApiResponseDto<PageEmployeeDto>> {
    return this.queryBus.execute(new GetEmployeesQuery(pageOptionsDto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get employee by ID',
    description:
      'Retrieve detailed information about a specific employee by their unique identifier',
  })
  @ApiSingleResponse(EmployeeDto, 'Employee retrieved successfully')
  @ApiCommonErrors()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    return this.queryBus.execute(new GetEmployeeQuery(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an employee',
    description:
      'Update employee information including personal details, job information, and photo. Supports partial updates through multipart form data.',
  })
  @ApiSingleResponse(EmployeeDto, 'Employee updated successfully')
  @ApiCommonErrors()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateEmployeeDto,
    description: 'Employee update data with optional photo upload',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @MultipartForm(UpdateEmployeeDto) updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    return this.commandBus.execute(
      new UpdateEmployeeCommand(id, updateEmployeeDto),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete an employee',
    description:
      'Soft delete an employee record. The employee and associated account will be marked as deleted but preserved in the system.',
  })
  @ApiOkResponse({
    description: 'Employee deleted successfully',
  })
  @ApiCommonErrors()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new DeleteEmployeeCommand(id));
  }
}
