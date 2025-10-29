import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import * as ExcelJS from 'exceljs';
import { DataSource, EntityManager, In } from 'typeorm';

import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { AccountEmployee } from '@src/modules/identities/entities/account-employee.entity';
import { AccountType } from '@src/modules/identities/entities/account-type.enum';
import { Account } from '@src/modules/identities/entities/account.entity';
import { EmployeeGate } from '@src/modules/identities/entities/employee-gates.entity';
import { EmployeeDto } from '../../dto/employee.dto';
import { EmployeeImageService } from '../../services/employee-image.service';
import { BulkInsertEmployeeCommand } from '../imp/bulk-insert-employee.command';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';

interface ExcelEmployeeData {
  EmployeeNumber: string;
  FullName: string;
  Department?: string;
  Position?: string;
  Email?: string;
  Phone?: string;
  HireDate?: string;
  EndDate?: string;
  ViolationPoint?: number;
  LocationID?: string;
  CompanyID?: string;
  Sertifikasi?: string;
  Gate?: string;
}

interface BulkInsertResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  data: EmployeeDto[];
}

@CommandHandler(BulkInsertEmployeeCommand)
export class BulkInsertEmployeeHandler
  extends BaseHandler<
    BulkInsertEmployeeCommand,
    ApiResponseDto<BulkInsertResult>
  >
  implements
    ICommandHandler<BulkInsertEmployeeCommand, ApiResponseDto<BulkInsertResult>>
{
  constructor(
    private readonly dataSource: DataSource,
    private readonly employeeImageService: EmployeeImageService,
  ) {
    super();
  }

  async handle(
    command: BulkInsertEmployeeCommand,
  ): Promise<ApiResponseDto<BulkInsertResult>> {
    const { bulkInsertEmployeeDto } = command;

    if (!bulkInsertEmployeeDto.file) {
      throw new BadRequestHttpException('File is required');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bulkInsertEmployeeDto.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new BadRequestHttpException(
        'Invalid Excel file: no worksheet found',
      );
    }

    const rows = worksheet.getSheetValues();
    if (!rows || rows.length < 2) {
      throw new BadRequestHttpException(
        'Excel file must contain at least header row and one data row',
      );
    }

    const result: BulkInsertResult = {
      success: 0,
      failed: 0,
      errors: [],
      data: [],
    };

    // Skip header row (index 0), start from index 1
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || (Array.isArray(row) && row.length === 1 && !row[1])) {
        continue; // Skip empty rows
      }

      try {
        const employeeData = this.parseExcelRow(row as any[]);
        await this.createEmployee(employeeData, result);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i,
          message: error.message || 'Unknown error',
        });
      }
    }

    return CreatedResponse(result, 'Bulk insert completed');
  }

  private parseExcelRow(row: any[]): ExcelEmployeeData {
    if (!row || row.length < 2) {
      throw new Error('Invalid row data');
    }

    // ExcelJS returns 1-indexed arrays, skip the first element (row number)
    const [
      ,
      // row number (ignored)
      employeeNumber,
      fullName,
      department,
      position,
      email,
      phone,
      hireDate,
      endDate,
      violationPoint,
      locationID,
      companyID,
      sertifikasi,
      gate,
    ] = row;

    if (!employeeNumber || !fullName) {
      throw new Error('EmployeeNumber and FullName are required');
    }

    return {
      EmployeeNumber: String(employeeNumber).trim(),
      FullName: String(fullName).trim(),
      Department: department ? String(department).trim() : undefined,
      Position: position ? String(position).trim() : undefined,
      Email: email ? String(email).trim() : undefined,
      Phone: phone ? String(phone).trim() : undefined,
      HireDate: hireDate ? String(hireDate).trim() : undefined,
      EndDate: endDate ? String(endDate).trim() : undefined,
      ViolationPoint: violationPoint ? Number(violationPoint) : 0,
      LocationID: locationID ? String(locationID).trim() : undefined,
      CompanyID: companyID ? String(companyID).trim() : undefined,
      Sertifikasi: sertifikasi ? String(sertifikasi).trim() : undefined,
      Gate: gate ? String(gate).trim() : undefined,
    };
  }

  private async createEmployee(
    data: ExcelEmployeeData,
    result: BulkInsertResult,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // Validate employee number uniqueness
      const existingEmployee = await manager.findOne(AccountEmployee, {
        where: { employeeNumber: data.EmployeeNumber },
      });

      if (existingEmployee) {
        throw new Error(
          `Employee number ${data.EmployeeNumber} already exists`,
        );
      }

      // Parse hire date
      let hireDate: Date | undefined = undefined;
      if (data.HireDate) {
        const parsedDate = this.parseDate(data.HireDate);
        if (parsedDate) {
          hireDate = parsedDate;
        }
      }
      // Parse hire date
      let endDate: Date | undefined = undefined;
      if (data.EndDate) {
        const parsedDate = this.parseDate(data.EndDate);
        if (parsedDate) {
          endDate = parsedDate;
        }
      }

      // Parse certifications
      let certifications: string[] = [];
      if (data.Sertifikasi) {
        certifications = data.Sertifikasi.split(',')
          .map((cert) => cert.trim())
          .filter((cert) => cert);
      }

      // Parse gates
      let gateIds: string[] = [];
      if (data.Gate) {
        const gateIdentifiers = data.Gate.split(',')
          .map((gate) => gate.trim())
          .filter((gate) => gate);

        gateIds = await manager
          .find(Gate, {
            where: {
              gateIdentifier: In(gateIdentifiers),
            },
          })
          .then((rows) => rows.map((row) => row.id));
      }

      // Create Account
      const account = manager.create(Account, {
        accountType: AccountType.EMPLOYEE,
        status: 1, // Active by default
      });

      const [savedAccount, company, location] = await Promise.all([
        manager.save(Account, account),
        manager.findOne(Company, {
          where: { name: data.CompanyID },
        }),
        manager.findOne(Location, {
          where: { name: data.LocationID },
        }),
      ]);

      if (!company || !location) {
        throw new Error('Company / Location doesnt exist in our database');
      }

      // Create Employee
      const employee = manager.create(AccountEmployee, {
        employeeNumber: data.EmployeeNumber,
        fullName: data.FullName,
        department: data.Department,
        position: data.Position,
        email: data.Email,
        phone: data.Phone,
        hireDate: hireDate,
        endDate: endDate,
        violationPoints: data.ViolationPoint || 0,
        locationId: location.id,
        companyId: company.id,
        certification: JSON.stringify(certifications),
        accountId: savedAccount.id,
      });

      const savedEmployee = await manager.save(AccountEmployee, employee);

      // Create Employee Gates if provided
      if (gateIds.length > 0) {
        await manager.save(
          EmployeeGate,
          gateIds.map((gateId: string) => {
            return manager.create(EmployeeGate, {
              gateId,
              employeeId: savedEmployee.id,
            });
          }),
        );
      }

      // Fetch complete data with relations
      const dto = await manager.findOne(AccountEmployee, {
        where: { id: savedEmployee.id },
        relations: ['account', 'supervisor', 'location', 'company'],
      });

      const employeeDto = plainToInstance(EmployeeDto, dto, {
        excludeExtraneousValues: true,
      });

      result.data.push(employeeDto);
    });
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Try different date formats
    const formats = [
      // DD/MM/YY or DD/MM/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
      // MM/DD/YY or MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        const [, part1, part2, part3] = match;
        let year: number, month: number, day: number;

        if (format === formats[0] || format === formats[1]) {
          // DD/MM/YYYY or MM/DD/YYYY - assume DD/MM/YYYY for this use case
          day = parseInt(part1);
          month = parseInt(part2) - 1; // JS months are 0-indexed
          year = parseInt(part3);
          if (year < 100) year += 2000; // Convert 2-digit year to 4-digit
        } else {
          // YYYY-MM-DD
          year = parseInt(part1);
          month = parseInt(part2) - 1;
          day = parseInt(part3);
        }

        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }
}
