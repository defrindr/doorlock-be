import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Company } from '@src/modules/master/companies/entities/company.entity';
import { Gate } from '@src/modules/master/gates/entities/gate.entity';

@Injectable()
export class VisitExcelTemplateService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {}

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Fetch data for dropdowns
    const [companies, gates] = await Promise.all([
      this.companyRepository.find({
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
    const worksheet = workbook.addWorksheet('Guest Visit Template');

    // Create dropdown data worksheets
    const companyDropdownSheet = workbook.addWorksheet('Company Data', {
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

    // === VISIT INFORMATION SECTION ===
    // Row 1: Nama Perusahaan
    worksheet.mergeCells('A1:A1');
    const companyLabelCell = worksheet.getCell('A1');
    companyLabelCell.value = 'Nama Perusahaan';
    companyLabelCell.font = { bold: true };
    companyLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow
    };

    worksheet.mergeCells('B1:D1');
    const companyValueCell = worksheet.getCell('B1');
    companyValueCell.value = 'Abadi Jaya Komputer Tbk';
    // Add company dropdown validation
    const companyRange =
      companies.length > 0
        ? `'Company Data'!$B$2:$B$${companies.length + 1}`
        : `'Company Data'!$B$2:$B$2`;
    companyValueCell.dataValidation = {
      type: 'list',
      formulae: [companyRange],
      showErrorMessage: false,
    };

    // Row 2: Tujuan Kunjungan
    worksheet.mergeCells('A2:A2');
    const purposeLabelCell = worksheet.getCell('A2');
    purposeLabelCell.value = 'Tujuan Kunjungan';
    purposeLabelCell.font = { bold: true };
    purposeLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow
    };

    worksheet.mergeCells('B2:D2');
    const purposeValueCell = worksheet.getCell('B2');
    purposeValueCell.value = 'Pemasangan Wifi pada gedung A3';

    // Row 3: Tanggal Awal Kunjungan
    worksheet.mergeCells('A3:A3');
    const startDateLabelCell = worksheet.getCell('A3');
    startDateLabelCell.value = 'Tanggal Awal Kunjungan';
    startDateLabelCell.font = { bold: true };
    startDateLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow
    };

    worksheet.mergeCells('B3:D3');
    const startDateValueCell = worksheet.getCell('B3');
    startDateValueCell.value = '';
    startDateValueCell.numFmt = 'dd/mm/yy hh.mm';

    // Row 4: Tanggal Akhir Kunjungan
    worksheet.mergeCells('A4:A4');
    const endDateLabelCell = worksheet.getCell('A4');
    endDateLabelCell.value = 'Tanggal Akhir Kunjungan';
    endDateLabelCell.font = { bold: true };
    endDateLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow
    };

    worksheet.mergeCells('B4:D4');
    const endDateValueCell = worksheet.getCell('B4');
    endDateValueCell.value = '';
    endDateValueCell.numFmt = 'dd/mm/yy hh.mm';

    // Row 5: Gate
    worksheet.mergeCells('A5:A5');
    const gateLabelCell = worksheet.getCell('A5');
    gateLabelCell.value = 'Gate';
    gateLabelCell.font = { bold: true };
    gateLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' }, // Yellow
    };

    worksheet.mergeCells('B5:D5');
    const gateValueCell = worksheet.getCell('B5');
    gateValueCell.value = '1,2,3';
    gateValueCell.note =
      'Masukkan gate identifier yang dipisahkan dengan koma (contoh: 1,2,3)';

    // Row 6: Empty row
    worksheet.getRow(6).height = 5;

    // === GUEST LIST SECTION ===
    // Row 7: Table Headers
    const headers = [
      'Nama Peserta',
      'Email',
      'Phone',
      'Type ID Card',
      'ID Card Number',
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(7, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4788' }, // Dark blue
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Set column widths
    worksheet.getColumn(1).width = 25; // Nama Peserta
    worksheet.getColumn(2).width = 30; // Email
    worksheet.getColumn(3).width = 20; // Phone
    worksheet.getColumn(4).width = 15; // Type ID Card
    worksheet.getColumn(5).width = 20; // ID Card Number

    // Add sample data (rows 8-9)
    const sampleData: any = [];

    sampleData.forEach((data: any[], index: number) => {
      const rowNumber = 8 + index;
      data.forEach((value, colIndex) => {
        worksheet.getCell(rowNumber, colIndex + 1).value = value;
      });
    });

    // Add data validation for guest list (rows 8 to 1000)
    this.addGuestListValidation(worksheet);

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private addGuestListValidation(worksheet: ExcelJS.Worksheet): void {
    // Add validation for Email (column B, rows 8-1000)
    for (let row = 8; row <= 1000; row++) {
      const emailCell = worksheet.getCell(`B${row}`);
      emailCell.dataValidation = {
        type: 'custom',
        formulae: [`=ISNUMBER(FIND("@",B${row}))`],
        showErrorMessage: false,
      };
    }

    // Add validation for Phone (column C, rows 8-1000)
    for (let row = 8; row <= 1000; row++) {
      const phoneCell = worksheet.getCell(`C${row}`);
      phoneCell.dataValidation = {
        type: 'custom',
        formulae: [`=LEFT(C${row},2)="62"`],
        showErrorMessage: false,
      };
    }

    // Add validation for Type ID Card (column D, rows 8-1000)
    const idCardTypes = ['ID Card', 'Passport', 'Driver License', 'KTP'];
    for (let row = 8; row <= 1000; row++) {
      const typeCell = worksheet.getCell(`D${row}`);
      typeCell.dataValidation = {
        type: 'list',
        formulae: [`"${idCardTypes.join(',')}"`],
        error: 'Identity type not valid',
        errorTitle: 'Select identity type',
        showErrorMessage: true,
      };
    }

    // Add comments to header cells
    worksheet.getCell('A7').note =
      'Nama lengkap peserta kunjungan (wajib diisi)';
    worksheet.getCell('B7').note =
      'Alamat email peserta (format: example@domain.com)';
    worksheet.getCell('C7').note =
      'Nomor telepon peserta (format: 628xxxxxxxxx)';
    worksheet.getCell('D7').note =
      'Jenis kartu identitas (pilih dari dropdown)';
    worksheet.getCell('E7').note = 'Nomor kartu identitas';
  }
}
