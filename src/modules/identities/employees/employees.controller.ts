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
  Res,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { MultipartForm } from '@src/shared/core/decorators/multipart-form.decorator';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { PageOptionsDto } from '@src/shared/paginations';
import { FastifyReply } from 'fastify';
import { BulkInsertEmployeeCommand } from './commands/imp/bulk-insert-employee.command';
import { CreateEmployeeCommand } from './commands/imp/create-employee.command';
import { DeleteEmployeeCommand } from './commands/imp/delete-employee.command';
import { ResetEmployeeViolationPointsCommand } from './commands/imp/reset-employee-violation-points.command';
import { UpdateEmployeeCommand } from './commands/imp/update-employee.command';
import { BulkInsertEmployeeDto } from './dto/bulk-insert-employee.dto';
import { BulkInsertResultDto } from './dto/bulk-insert-result.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeDto } from './dto/employee.dto';
import { PageEmployeeDto } from './dto/page-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { GetEmployeeQuery } from './queries/imp/get-employee.query';
import { GetEmployeesQuery } from './queries/imp/get-employees.query';
import { EmployeeExcelTemplateService } from './services/employee-excel-template.service';

@Controller('identities/employees')
@ApiTags('Employees')
export class EmployeesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly employeeExcelTemplateService: EmployeeExcelTemplateService,
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
  @PermissionAccess('identity:manage')
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
  @PermissionAccess('identity:manage')
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
  @PermissionAccess()
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
  @PermissionAccess()
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
  @PermissionAccess('identity:manage')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @MultipartForm(UpdateEmployeeDto) updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<ApiResponseDto<EmployeeDto>> {
    return this.commandBus.execute(
      new UpdateEmployeeCommand(id, updateEmployeeDto),
    );
  }

  @Post(':id/reset-point')
  @ApiOperation({
    summary: 'Reset employee violation points to zero',
    description:
      'Reset the violation points of a specific employee to zero. This action cannot be undone.',
  })
  @ApiSingleResponse(null, 'Employee violation points reset successfully', 200)
  @ApiCommonErrors()
  @HttpCode(200)
  @PermissionAccess('identity:manage')
  async resetViolationPoints(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new ResetEmployeeViolationPointsCommand(id));
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
  @PermissionAccess('identity:manage')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<null>> {
    return this.commandBus.execute(new DeleteEmployeeCommand(id));
  }

  @Get('template/download')
  @ApiOperation({
    summary: 'Download employee Excel template',
    description:
      'Download an Excel template file for bulk employee import with sample data and validation rules.',
  })
  @ApiOkResponse({
    description: 'Excel template file downloaded successfully',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
  })
  @ApiCommonErrors()
  async downloadTemplate(@Res() res: FastifyReply): Promise<void> {
    const buffer = await this.employeeExcelTemplateService.generateTemplate();

    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.header(
      'Content-Disposition',
      'attachment; filename="employee-template.xlsx"',
    );
    res.header('Content-Length', buffer.length.toString());

    res.send(buffer);
  }
}
