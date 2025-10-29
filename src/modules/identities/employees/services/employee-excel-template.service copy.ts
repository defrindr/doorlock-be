import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Location } from '@src/modules/master/locations/entities/location.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';

export interface EmployeeTemplateData {
  EmployeeNumber: string;
  FullName: string;
  Department: string;
  Position: string;
  Email: string;
  Phone: string;
  HireDate: string;
  EndDate: string;
  ViolationPoint: number;
  LocationID: string;
  CompanyID: string;
  Sertifikasi: string;
  Gate: string;
}

@Injectable()
export class EmployeeExcelTemplateService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {}

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Fetch data for dropdowns
    const [companies, locations, gates] = await Promise.all([
      this.companyRepository.find({
        where: { status: 1 },
        select: ['id', 'name'],
        order: { name: 'ASC' },
      }),
      this.locationRepository.find({
        where: { status: 1 },
        select: ['id', 'name'],
        order: { name: 'ASC' },
      }),
      this.gateRepository.find({
        where: { status: 1 },
        select: ['id', 'name', 'gateIdentifier'],
        order: { name: 'ASC' },
      }),
    ]);

    // Create main template worksheet
    const worksheet = workbook.addWorksheet('Employee Template');

    // Create dropdown data worksheets (visible for reference)
    const companyDropdownSheet = workbook.addWorksheet('Company Data', {
      state: 'veryHidden',
    });
    const locationDropdownSheet = workbook.addWorksheet('Location Data', {
      state: 'veryHidden',
    });
    const gateDropdownSheet = workbook.addWorksheet('Gate Data');

    // Add company data for dropdown
    companyDropdownSheet.addRow(['CompanyID', 'CompanyName']);
    companies.forEach((company) => {
      companyDropdownSheet.addRow([company.id, company.name]);
    });

    // Style company dropdown sheet
    companyDropdownSheet.getRow(1).font = { bold: true };
    companyDropdownSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    };
    companyDropdownSheet.getColumn('A').width = 40;
    companyDropdownSheet.getColumn('B').width = 30;

    // Add location data for dropdown
    locationDropdownSheet.addRow(['LocationID', 'LocationName']);
    locations.forEach((location) => {
      locationDropdownSheet.addRow([location.id, location.name]);
    });

    // Style location dropdown sheet
    locationDropdownSheet.getRow(1).font = { bold: true };
    locationDropdownSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    };
    locationDropdownSheet.getColumn('A').width = 40;
    locationDropdownSheet.getColumn('B').width = 30;

    // Add gate data for dropdown
    gateDropdownSheet.addRow(['GateID', 'GateName', 'GateIdentifier']);
    gates.forEach((gate) => {
      gateDropdownSheet.addRow([gate.id, gate.name, gate.gateIdentifier]);
    });

    // Style gate dropdown sheet
    gateDropdownSheet.getRow(1).font = { bold: true };
    gateDropdownSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    };
    gateDropdownSheet.getColumn('A').width = 40;
    gateDropdownSheet.getColumn('B').width = 30;
    gateDropdownSheet.getColumn('C').width = 15;

    // Define columns with headers
    worksheet.columns = [
      { header: 'EmployeeNumber', key: 'EmployeeNumber', width: 15 },
      { header: 'FullName', key: 'FullName', width: 25 },
      { header: 'Department', key: 'Department', width: 20 },
      { header: 'Position', key: 'Position', width: 20 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Phone', key: 'Phone', width: 15 },
      { header: 'HireDate', key: 'HireDate', width: 12 },
      { header: 'EndDate', key: 'EndDate', width: 12 },
      { header: 'ViolationPoint', key: 'ViolationPoint', width: 15 },
      { header: 'LocationID', key: 'LocationID', width: 40 },
      { header: 'CompanyID', key: 'CompanyID', width: 40 },
      { header: 'Sertifikasi', key: 'Sertifikasi', width: 30 },
      { header: 'Gate', key: 'Gate', width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }, // Light lavender background
    };

    // Add data validation and comments for better UX
    this.addDataValidationAndComments(worksheet, companies, locations, gates);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private addDataValidationAndComments(
    worksheet: ExcelJS.Worksheet,
    companies: Company[],
    locations: Location[],
    gates: Gate[],
  ): void {
    // Add comments to explain each column
    const comments = {
      1: 'Nomor karyawan (unique identifier)',
      2: 'Nama lengkap karyawan',
      3: 'Departemen/divisi karyawan',
      4: 'Jabatan/posisi karyawan',
      5: 'Alamat email karyawan',
      6: 'Nomor telepon karyawan (format: 628xxxxxxxxx)',
      7: 'Tanggal mulai bekerja (format: DD/MM/YY)',
      8: 'Tanggal berakhir kontrak (format: DD/MM/YY)',
      9: 'Poin pelanggaran awal (default: 0)',
      10: 'UUID lokasi kerja karyawan (pilih dari dropdown)',
      11: 'UUID perusahaan karyawan (pilih dari dropdown)',
      12: 'Sertifikasi yang dimiliki (pisahkan dengan koma)',
      13: 'ID gate yang dapat diakses (pilih multiple dari dropdown, pisahkan dengan koma)',
    };

    // Add comments to header row
    Object.entries(comments).forEach(([colIndex, comment]) => {
      const cell = worksheet.getCell(1, parseInt(colIndex));
      cell.note = comment;
    });

    // Add data validation for phone numbers (should start with 62)
    const phoneColumn = worksheet.getColumn('F'); // Phone column
    phoneColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        cell.dataValidation = {
          type: 'custom',
          formulae: [`=LEFT(${cell.address},2)="62"`],
          error: 'Nomor telepon harus dimulai dengan 62',
          errorTitle: 'Format Nomor Telepon',
        };
      }
    });

    // Add data validation for email format
    const emailColumn = worksheet.getColumn('E'); // Email column
    emailColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        cell.dataValidation = {
          type: 'custom',
          formulae: [`=ISNUMBER(FIND("@",${cell.address}))`],
          error: 'Format email tidak valid',
          errorTitle: 'Format Email',
        };
      }
    });

    // Add dropdown validation for CompanyID (column K)
    const companyColumn = worksheet.getColumn('K'); // CompanyID column
    companyColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        const companyRange =
          companies.length > 0
            ? `'Company Data'!$B$2:$B$${companies.length + 1}`
            : `'Company Data'!$B$2:$B$2`; // Fallback if no companies

        cell.dataValidation = {
          type: 'list',
          formulae: [companyRange],
          error: 'Pilih perusahaan dari dropdown',
          errorTitle: 'Perusahaan Tidak Valid',
          showErrorMessage: true,
        };
      }
    });

    // Add dropdown validation for LocationID (column J)
    const locationColumn = worksheet.getColumn('J'); // LocationID column
    locationColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        const locationRange =
          locations.length > 0
            ? `'Location Data'!$B$2:$B$${locations.length + 1}`
            : `'Location Data'!$B$2:$B$2`; // Fallback if no locations

        cell.dataValidation = {
          type: 'list',
          formulae: [locationRange],
          error: 'Pilih lokasi dari dropdown',
          errorTitle: 'Lokasi Tidak Valid',
          showErrorMessage: true,
        };
      }
    });

    // Add dropdown validation for Gate (column M)
    const gateColumn = worksheet.getColumn('M'); // Gate column
    gateColumn.eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        const gateRange =
          gates.length > 0
            ? `'Gate Data'!$C$2:$C$${gates.length + 1}`
            : `'Gate Data'!$C$2:$C$2`; // Fallback if no gates

        cell.dataValidation = {
          type: 'list',
          formulae: [gateRange],
          error:
            'Pilih gate dari dropdown (dapat memilih multiple, pisahkan dengan koma)',
          errorTitle: 'Gate Tidak Valid',
          showErrorMessage: true,
        };
      }
    });
  }
}
