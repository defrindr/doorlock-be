import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as PDFKit from 'pdfkit';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { ExportHistoriesQuery } from '../imp/export-histories.query';
import { History } from '../../entities/history.entity';

@QueryHandler(ExportHistoriesQuery)
export class ExportHistoriesHandler
  extends BaseHandler<ExportHistoriesQuery, Buffer>
  implements IQueryHandler<ExportHistoriesQuery, Buffer>
{
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async handle(query: ExportHistoriesQuery): Promise<Buffer> {
    const { format, filters } = query;

    // Build query with filters
    let queryBuilder = this.historyRepository.createQueryBuilder('history');

    // Apply timestamp filter if provided
    if (filters?.timestamp) {
      queryBuilder.andWhere('history.timestamp BETWEEN :start AND :end', {
        start: filters.timestamp.start,
        end: filters.timestamp.end,
      });
    }

    // Apply other filters using the existing pagination filter logic
    if (filters) {
      const { ...otherFilters } = filters;
      queryBuilder = applyPaginationFilters(queryBuilder, {
        alias: 'history',
        allowedSort: ['timestamp', 'id', 'status'],
        allowedSearch: ['companyName', 'accountName', 'gateName'],
        allowedFilter: ['id', 'status'],
        pageOptions: {
          skip: 0,
          take: 10000, // Large limit for export
          ...otherFilters,
        },
      });
    }

    // Order by timestamp descending for export
    queryBuilder.orderBy('history.timestamp', 'DESC');

    const entities = await queryBuilder.getMany();

    if (format === 'excel') {
      return this.generateExcel(entities);
    } else if (format === 'pdf') {
      return this.generatePDF(entities);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async generateExcel(histories: History[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Histories');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Timestamp', key: 'timestamp', width: 20 },
      { header: 'Account Name', key: 'accountName', width: 25 },
      { header: 'Account Identifier', key: 'accountIdentifier', width: 25 },
      { header: 'Company Name', key: 'companyName', width: 25 },
      { header: 'Gate Name', key: 'gateName', width: 20 },
      { header: 'Gate Identifier', key: 'gateIdentifier', width: 15 },
      { header: 'Card UID', key: 'cardUid', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Message', key: 'message', width: 40 },
      // { header: 'More Details', key: 'moreDetails', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    };

    // Add data rows
    histories.forEach((history) => {
      worksheet.addRow({
        id: history.id,
        timestamp: history.timestamp.toISOString(),
        accountName: history.accountName || '',
        accountIdentifier: history.accountIdentifier,
        companyName: history.companyName,
        gateName: history.gateName || '',
        gateIdentifier: history.gateIdentifier,
        cardUid: history.cardUid,
        status: history.status,
        message: history.message,
        // moreDetails: history.moreDetails || '',
      });
    });

    // Return buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private generatePDF(histories: History[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFKit();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Title
      doc.fontSize(20).text('Access History Report', { align: 'center' });
      doc.moveDown();

      // Date range if available
      if (histories.length > 0) {
        const startDate = histories[histories.length - 1]?.timestamp;
        const endDate = histories[0]?.timestamp;
        if (startDate && endDate) {
          doc
            .fontSize(12)
            .text(
              `Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
              { align: 'center' },
            );
          doc.moveDown();
        }
      }

      // Summary
      doc.fontSize(14).text(`Total Records: ${histories.length}`);
      doc.moveDown();

      // Table headers
      const headers = [
        'Timestamp',
        'Account',
        'Company',
        'Gate',
        'Status',
        'Message',
      ];

      let yPosition = doc.y + 20;
      const columnWidths = [80, 80, 80, 60, 50, 150];
      let xPosition = 50;

      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition, {
          width: columnWidths[index],
          align: 'left',
        });
        xPosition += columnWidths[index];
      });

      // Draw header line
      doc
        .moveTo(50, yPosition + 15)
        .lineTo(50 + columnWidths.reduce((a, b) => a + b, 0), yPosition + 15)
        .stroke();

      // Table data
      doc.font('Helvetica');
      yPosition += 25;

      histories.forEach((history) => {
        if (yPosition > 700) {
          // New page if needed
          doc.addPage();
          yPosition = 50;
        }

        xPosition = 50;
        const rowData = [
          history.timestamp.toLocaleString(),
          history.accountName || history.accountIdentifier,
          history.companyName,
          history.gateName || `Gate ${history.gateIdentifier}`,
          history.status.toUpperCase(),
          history.message.length > 50
            ? history.message.substring(0, 47) + '...'
            : history.message,
        ];

        rowData.forEach((data, colIndex) => {
          doc.text(data, xPosition, yPosition, {
            width: columnWidths[colIndex],
            align: 'left',
          });
          xPosition += columnWidths[colIndex];
        });

        yPosition += 20;
      });

      doc.end();
    });
  }
}
